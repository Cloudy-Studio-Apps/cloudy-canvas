// Rust is only for desktop-specific integration. Business logic lives in TypeScript (src/core, src/engine)
// so the future web version can reuse it.
mod app_links;
mod mcp;
mod open_files;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    // Registered first, so a second launch hands its files to this one and exits.
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
        open_files::on_second_instance(app, argv, cwd);
    }));

    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .manage(mcp::McpState::new())
        .manage(open_files::LaunchFiles::from_env())
        .invoke_handler(tauri::generate_handler![
            mcp::commands::mcp_reply,
            mcp::commands::mcp_status,
            mcp::commands::mcp_set_enabled,
            open_files::launch_files,
            app_links::launch_links
        ])
        .setup(|app| {
            mcp::start(app.handle());
            app_links::setup(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
