// Rust is only for desktop-specific integration. Business logic lives in TypeScript (src/core, src/engine)
// so the future web version can reuse it.
mod mcp;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(mcp::McpState::new())
        .invoke_handler(tauri::generate_handler![
            mcp::commands::mcp_reply,
            mcp::commands::mcp_status,
            mcp::commands::mcp_set_enabled
        ])
        .setup(|app| {
            mcp::start(app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
