use std::sync::Mutex;
use tauri::AppHandle;
use tauri_plugin_shell::{process::CommandChild, process::CommandEvent, ShellExt};

/// Manages the lifecycle of the .NET sidecar process.
pub struct SidecarManager {
    process: Mutex<Option<CommandChild>>,
}

impl SidecarManager {
    pub fn new() -> Self {
        Self {
            process: Mutex::new(None),
        }
    }

    /// Starts the .NET sidecar process and returns the port it bound to.
    /// The sidecar prints `SIDECAR_PORT:<port>` to stdout once ready.
    pub async fn start(&self, app: &AppHandle) -> Result<u16, String> {
        let sidecar_command = app
            .shell()
            .sidecar("pudu-launcher-sidecar")
            .map_err(|e| format!("Failed to create sidecar command: {}", e))?;

        let (rx, child) = sidecar_command
            .spawn()
            .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

        *self.process.lock().unwrap() = Some(child);

        let timeout = tokio::time::Duration::from_secs(10);
        let result = tokio::time::timeout(timeout, Self::read_port(rx)).await;

        match result {
            Ok(Ok((port, rx))) => {
                tokio::spawn(Self::forward_output(rx));
                log::info!(target: "PuduTauri", "Sidecar started on port {}", port);
                Ok(port)
            }
            Ok(Err(e)) => Err(e),
            Err(_) => Err("Sidecar failed to report port within 10 seconds".to_string()),
        }
    }

    async fn read_port(
        mut rx: tauri::async_runtime::Receiver<CommandEvent>,
    ) -> Result<(u16, tauri::async_runtime::Receiver<CommandEvent>), String> {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let text = String::from_utf8_lossy(&line);
                    if let Some(port_str) = text.strip_prefix("SIDECAR_PORT:") {
                        let port: u16 = port_str
                            .trim()
                            .parse()
                            .map_err(|e| format!("Invalid port from sidecar: {}", e))?;
                        return Ok((port, rx));
                    }
                    // Forward any other stdout as info
                    forward_dotnet_line(&text);
                }
                CommandEvent::Stderr(line) => {
                    forward_dotnet_line(&String::from_utf8_lossy(&line));
                }
                CommandEvent::Terminated(payload) => {
                    return Err(format!(
                        "Sidecar terminated before reporting port (code: {:?})",
                        payload.code
                    ));
                }
                _ => {}
            }
        }
        Err("Sidecar output channel closed before port was reported".to_string())
    }

    async fn forward_output(mut rx: tauri::async_runtime::Receiver<CommandEvent>) {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    forward_dotnet_line(&String::from_utf8_lossy(&line));
                }
                CommandEvent::Stderr(line) => {
                    forward_dotnet_line(&String::from_utf8_lossy(&line));
                }
                CommandEvent::Terminated(payload) => {
                    log::info!(target: "PuduBackend", "Sidecar terminated with code: {:?}", payload.code);
                    break;
                }
                _ => {}
            }
        }
    }

    /// Stops the sidecar process.
    pub fn stop(&self) {
        if let Some(child) = self.process.lock().unwrap().take() {
            let _ = child.kill();
            log::info!(target: "PuduTauri", "Sidecar stopped");
        }
    }
}

impl Drop for SidecarManager {
    fn drop(&mut self) {
        self.stop();
    }
}

/// Parses a .NET Serilog line like `[INF] message` and forwards it
/// through the `log` crate at the correct level with target "PuduBackend".
fn forward_dotnet_line(line: &str) {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return;
    }

    // Serilog short level format: [VRB] [DBG] [INF] [WRN] [ERR] [FTL]
    if let Some(rest) = trimmed.strip_prefix("[FTL] ") {
        log::error!(target: "PuduBackend", "{}", rest);
    } else if let Some(rest) = trimmed.strip_prefix("[ERR] ") {
        log::error!(target: "PuduBackend", "{}", rest);
    } else if let Some(rest) = trimmed.strip_prefix("[WRN] ") {
        log::warn!(target: "PuduBackend", "{}", rest);
    } else if let Some(rest) = trimmed.strip_prefix("[INF] ") {
        log::info!(target: "PuduBackend", "{}", rest);
    } else if let Some(rest) = trimmed.strip_prefix("[DBG] ") {
        log::debug!(target: "PuduBackend", "{}", rest);
    } else if let Some(rest) = trimmed.strip_prefix("[VRB] ") {
        log::trace!(target: "PuduBackend", "{}", rest);
    } else {
        // No recognized prefix — forward as info
        log::info!(target: "PuduBackend", "{}", trimmed);
    }
}
