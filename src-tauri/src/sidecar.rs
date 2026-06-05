use std::sync::Arc;
use std::sync::Mutex;
use tauri::AppHandle;
use tauri_plugin_shell::{process::CommandChild, process::CommandEvent, ShellExt};
use tokio::sync::Notify;

/// How long to wait for the sidecar to exit gracefully before hard-killing it.
const GRACEFUL_SHUTDOWN_SECS: u64 = 5;

/// Manages the lifecycle of the .NET sidecar process.
pub struct SidecarManager {
    process: Mutex<Option<CommandChild>>,
    /// Signaled when the sidecar reports it has terminated.
    exit_notify: Arc<Notify>,
}

impl SidecarManager {
    pub fn new() -> Self {
        Self {
            process: Mutex::new(None),
            exit_notify: Arc::new(Notify::new()),
        }
    }

    /// Starts the .NET sidecar process and returns the port it bound to.
    /// The sidecar prints `SIDECAR_PORT:<port>` to stdout repeatedly until we
    /// acknowledge via stdin, forming a reliable handshake.
    pub async fn start(&self, app: &AppHandle) -> Result<u16, String> {
        let host_exe = std::env::current_exe()
            .map_err(|e| format!("Failed to resolve host executable path: {}", e))?;

        let host_pid = std::process::id().to_string();
        let sidecar_command = app
            .shell()
            .sidecar("pudu-launcher-sidecar")
            .map_err(|e| format!("Failed to create sidecar command: {}", e))?
            .args([
                "--host-exe",
                &host_exe.to_string_lossy(),
                "--host-pid",
                &host_pid,
            ]);

        let (rx, child) = sidecar_command
            .spawn()
            .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

        *self.process.lock().unwrap() = Some(child);

        let timeout = tokio::time::Duration::from_secs(30);
        let result = tokio::time::timeout(timeout, Self::read_port(rx)).await;

        match result {
            Ok(Ok((port, rx))) => {
                // Acknowledge the port so the sidecar stops repeating it
                if let Some(ref mut child) = *self.process.lock().unwrap() {
                    let _ = child.write(b"ACK\n");
                }
                tokio::spawn(Self::forward_output(rx, self.exit_notify.clone()));
                log::info!(target: "PuduTauri", "Sidecar started on port {}", port);
                Ok(port)
            }
            Ok(Err(e)) => Err(e),
            Err(_) => Err("Sidecar failed to report port within 30 seconds".to_string()),
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

    async fn forward_output(
        mut rx: tauri::async_runtime::Receiver<CommandEvent>,
        exit_notify: Arc<Notify>,
    ) {
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
                    // Wake any graceful-shutdown waiter. notify_one stores a permit
                    // if no one is waiting yet, so stop() never misses the signal.
                    exit_notify.notify_one();
                    break;
                }
                _ => {}
            }
        }
    }

    /// Stops the sidecar process gracefully.
    ///
    /// Sends a SHUTDOWN signal over stdin so the .NET host can stop the TTS
    /// server before exiting, waits a bounded time for it to exit, then
    /// hard-kills it as a fallback.
    pub fn stop(&self) {
        // Send the graceful shutdown signal while holding the lock briefly.
        {
            let mut guard = self.process.lock().unwrap();
            match guard.as_mut() {
                Some(child) => {
                    let _ = child.write(b"SHUTDOWN\n");
                }
                None => return,
            }
        }

        // Wait for the sidecar to exit on its own, bounded by the grace period.
        let exited_gracefully = tauri::async_runtime::block_on(async {
            tokio::time::timeout(
                tokio::time::Duration::from_secs(GRACEFUL_SHUTDOWN_SECS),
                self.exit_notify.notified(),
            )
            .await
            .is_ok()
        });

        if let Some(child) = self.process.lock().unwrap().take() {
            if exited_gracefully {
                log::info!(target: "PuduTauri", "Sidecar exited gracefully");
            } else {
                let _ = child.kill();
                log::warn!(target: "PuduTauri", "Sidecar hard-killed after graceful timeout");
            }
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
        // No recognized prefix, forward as info
        log::info!(target: "PuduBackend", "{}", trimmed);
    }
}
