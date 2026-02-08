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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Folder {
                        path: std::env::current_exe()
                            .expect("failed to resolve exe path")
                            .parent()
                            .expect("exe has no parent directory")
                            .join("logs"),
                        file_name: Some("pudu-launcher".into()),
                    }),
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
        .invoke_handler(tauri::generate_handler![get_sidecar_port])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                let sidecar = app_handle.state::<SidecarManager>();
                sidecar.stop();
            }
        });
}
