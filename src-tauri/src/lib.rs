// Rust is only for desktop-specific integration. Business logic lives in TypeScript (src/core, src/engine)
// so the future web version can reuse it.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
