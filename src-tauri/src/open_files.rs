//! Files the OS asks the app to open: paths given at launch ("Open with", a command line) and
//! paths a second launch forwards to the running app. Which of them are Cloudy Canvas files is
//! decided in TypeScript.

use std::path::Path;
use std::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager, State};

use crate::app_links;

/// Emitted with the paths a later launch asked to open.
const OPEN_FILES_EVENT: &str = "app://open-files";

/// The paths this process was launched with, until the webview takes them.
pub struct LaunchFiles(Mutex<Vec<String>>);

impl LaunchFiles {
    pub fn from_env() -> Self {
        let cwd = std::env::current_dir().unwrap_or_default();
        Self(Mutex::new(paths_from_args(std::env::args(), &cwd)))
    }
}

/// Returns the launch paths once; later calls get nothing, so a reload doesn't reopen them.
#[tauri::command]
pub fn launch_files(state: State<'_, LaunchFiles>) -> Vec<String> {
    state.0.lock().map(|mut paths| std::mem::take(&mut *paths)).unwrap_or_default()
}

/// A second launch (single instance): bring the window forward and pass its paths on.
pub fn on_second_instance(app: &AppHandle, argv: Vec<String>, cwd: String) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
    let paths = paths_from_args(argv, Path::new(&cwd));
    if !paths.is_empty() {
        let _ = app.emit(OPEN_FILES_EVENT, paths);
    }
}

/// The arguments after the program name that aren't flags or links (`app_links`), made absolute
/// against `cwd`.
fn paths_from_args(args: impl IntoIterator<Item = String>, cwd: &Path) -> Vec<String> {
    args.into_iter()
        .skip(1)
        .filter(|arg| !arg.starts_with('-') && !app_links::is_link(arg))
        .map(|arg| cwd.join(arg).to_string_lossy().into_owned())
        .collect()
}
