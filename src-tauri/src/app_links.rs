//! `cloudy-canvas://` links (the scheme is in `tauri.conf.json`, `plugins.deep-link`). The OS starts
//! the app with the link, or a second launch forwards it (single instance); what a link does is
//! decided in TypeScript.

use std::sync::Mutex;

use tauri::{App, AppHandle, Emitter, Manager, State};
use tauri_plugin_deep_link::DeepLinkExt;

/// Emitted with the links opened while the app runs.
const OPEN_LINKS_EVENT: &str = "app://open-links";

/// The links this process was launched with, until the webview takes them.
pub struct LaunchLinks(Mutex<Vec<String>>);

/// Whether a launch argument is a link rather than a file path.
pub fn is_link(arg: &str) -> bool {
    arg.contains("://")
}

/// Takes the launch links, forwards later ones to the webview and, where no installer did it,
/// registers the scheme with the OS.
pub fn setup(app: &App) -> tauri::Result<()> {
    let links = app.deep_link().get_current().ok().flatten().unwrap_or_default();
    app.manage(LaunchLinks(Mutex::new(links.iter().map(|url| url.to_string()).collect())));

    let handle = app.handle().clone();
    app.deep_link().on_open_url(move |event| {
        let links: Vec<String> = event.urls().iter().map(|url| url.to_string()).collect();
        emit_links(&handle, links);
    });

    register_scheme(app);
    Ok(())
}

/// Returns the launch links once; later calls get nothing, so a reload doesn't reopen them.
#[tauri::command]
pub fn launch_links(state: State<'_, LaunchLinks>) -> Vec<String> {
    state.0.lock().map(|mut links| std::mem::take(&mut *links)).unwrap_or_default()
}

fn emit_links(app: &AppHandle, links: Vec<String>) {
    if !links.is_empty() {
        let _ = app.emit(OPEN_LINKS_EVENT, links);
    }
}

/// The NSIS/MSI installers and the Linux packages register the scheme themselves; dev builds and
/// the AppImage (which installs nothing) register it for the current user when they start.
#[allow(unused_variables)]
fn register_scheme(app: &App) {
    #[cfg(any(windows, target_os = "linux"))]
    {
        let unpackaged = cfg!(debug_assertions) || app.env().appimage.is_some();
        if unpackaged {
            if let Err(error) = app.deep_link().register_all() {
                eprintln!("[app-links] couldn't register the link scheme: {error}");
            }
        }
    }
}
