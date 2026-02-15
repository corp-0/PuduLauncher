use std::sync::Mutex;
use tauri::Manager;

mod sidecar;
use sidecar::SidecarManager;

/// Holds the sidecar port so the frontend can discover it.
struct SidecarPort(Mutex<Option<u16>>);

#[tauri::command]
fn get_sidecar_port(state: tauri::State<SidecarPort>) -> Result<u16, String> {
    state
        .0
        .lock()
        .unwrap()
        .ok_or_else(|| "Sidecar not started yet".to_string())
}

#[tauri::command]
fn open_log_directory(app: tauri::AppHandle) -> Result<(), String> {
    let log_dir = resolve_log_directory(&app)?;

    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .reveal_item_in_dir(log_dir)
        .map_err(|e| e.to_string())
}

/// Resolves the actual log directory path, matching the logic used by `resolve_log_target`.
fn resolve_log_directory(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    if cfg!(target_os = "windows") {
        if let Some(folder) = exe_relative_log_folder() {
            return Ok(folder);
        }
    }

    app.path()
        .app_log_dir()
        .map_err(|e| format!("Failed to resolve log directory: {e}"))
}

/// On Windows, try to place logs next to the executable (convenient for portable installs).
/// Falls back to the platform log directory if the exe-relative path is not writable.
/// On other platforms, always use the platform log directory.
fn resolve_log_target() -> tauri_plugin_log::TargetKind {
    if cfg!(target_os = "windows") {
        if let Some(folder) = exe_relative_log_folder() {
            return tauri_plugin_log::TargetKind::Folder {
                path: folder,
                file_name: Some("pudu-launcher".into()),
            };
        }
    }

    tauri_plugin_log::TargetKind::LogDir {
        file_name: Some("pudu-launcher".into()),
    }
}

/// Returns the `logs/` folder next to the executable if it is writable, or `None` otherwise.
fn exe_relative_log_folder() -> Option<std::path::PathBuf> {
    let logs_dir = std::env::current_exe()
        .ok()?
        .parent()?
        .join("logs");

    std::fs::create_dir_all(&logs_dir).ok()?;

    // Probe actual write access with a temp file.
    let probe = logs_dir.join(".write_probe");
    std::fs::write(&probe, b"").ok()?;
    let _ = std::fs::remove_file(&probe);

    Some(logs_dir)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(resolve_log_target()),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stderr),
                ])
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .max_file_size(10_000_000) // 10 MB per file
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarPort(Mutex::new(None)))
        .manage(SidecarManager::new())
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let sidecar = app_handle.state::<SidecarManager>();
                match sidecar.start(&app_handle).await {
                    Ok(port) => {
                        let port_state = app_handle.state::<SidecarPort>();
                        *port_state.0.lock().unwrap() = Some(port);
                        log::info!(target: "PuduTauri", "Sidecar ready on port {}", port);
                    }
                    Err(e) => log::error!(target: "PuduTauri", "Failed to start sidecar: {}", e),
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_sidecar_port, open_log_directory])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                let sidecar = app_handle.state::<SidecarManager>();
                sidecar.stop();
            }
        });
}
