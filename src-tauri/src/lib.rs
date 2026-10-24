// Rust is only for desktop-specific integration. Business logic lives in TypeScript (src/core, src/engine)
// so the future web version can reuse it.
mod app_links;
mod install_kind;
mod mcp;
mod open_files;
mod share;
mod system_fonts;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    // Registered first, so a second launch hands its files to this one and exits.
    // (Debug builds started with CLOUDY_INSTANCE set skip it, to test live sessions on one machine.)
    #[cfg(desktop)]
    let builder = if second_instance_allowed() {
        builder
    } else {
        builder.plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            open_files::on_second_instance(app, argv, cwd);
        }))
    };
    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init());

    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .manage(mcp::McpState::new())
        .manage(share::ShareState::new())
        .manage(open_files::LaunchFiles::from_env())
        .invoke_handler(tauri::generate_handler![
            mcp::commands::mcp_reply,
            mcp::commands::mcp_status,
            mcp::commands::mcp_set_enabled,
            share::commands::share_host,
            share::commands::share_join,
            share::commands::share_send,
            share::commands::share_close_peer,
            share::commands::share_peer_path,
            share::commands::share_stop,
            share::commands::share_relay_test,
            open_files::launch_files,
            app_links::launch_links,
            install_kind::install_kind,
            system_fonts::system_fonts,
            system_fonts::system_font_data
        ])
        .setup(|app| {
            mcp::start(app.handle());
            app_links::setup(app)?;
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(open_files::on_run_event);
}

/// A second window for testing live sessions on one machine: debug builds with `CLOUDY_INSTANCE`.
#[cfg(desktop)]
fn second_instance_allowed() -> bool {
    cfg!(debug_assertions) && std::env::var_os("CLOUDY_INSTANCE").is_some()
}
