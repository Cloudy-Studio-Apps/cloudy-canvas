//! Files the OS asks the app to open: paths given at launch ("Open with", a command line), paths a
//! second launch forwards to the running app and, on macOS, files opened from Finder (an event,
//! never launch arguments). Which of them are Cloudy Canvas files is decided in TypeScript.

use std::path::Path;
use std::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager, RunEvent, State};

use crate::app_links;

/// Emitted with the paths a later launch asked to open.
const OPEN_FILES_EVENT: &str = "app://open-files";

/// The paths this process was launched with, until the webview takes them.
pub struct LaunchFiles(Mutex<Launch>);

struct Launch {
    paths: Vec<String>,
    /// Whether the webview took the launch paths: later ones are sent as events.
    taken: bool,
}

impl LaunchFiles {
    pub fn from_env() -> Self {
        let cwd = std::env::current_dir().unwrap_or_default();
        let paths = paths_from_args(std::env::args(), &cwd);
        Self(Mutex::new(Launch { paths, taken: false }))
    }
}

/// Returns the launch paths once; later calls get nothing, so a reload doesn't reopen them.
#[tauri::command]
pub fn launch_files(state: State<'_, LaunchFiles>) -> Vec<String> {
    let Ok(mut launch) = state.0.lock() else { return Vec::new() };
    launch.taken = true;
    std::mem::take(&mut launch.paths)
}

/// The app's run loop events. macOS hands over files opened from Finder (double-click, "Open
/// With", dropped on the Dock icon) as `Opened`, at launch too.
#[allow(unused_variables)]
pub fn on_run_event(app: &AppHandle, event: RunEvent) {
    #[cfg(target_os = "macos")]
    if let RunEvent::Opened { urls } = event {
        // Links come this way too; the deep-link plugin takes those.
        let paths = urls
            .iter()
            .filter_map(|url| url.to_file_path().ok())
            .map(|path| path.to_string_lossy().into_owned())
            .collect();
        forward(app, paths);
    }
}

/// A second launch (single instance): bring the window forward and pass its paths on.
pub fn on_second_instance(app: &AppHandle, argv: Vec<String>, cwd: String) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
    forward(app, paths_from_args(argv, Path::new(&cwd)));
}

/// Paths asked for while the app runs: kept with the launch paths until the webview takes them
/// (macOS sends the files it was launched with before the webview loads), sent after.
fn forward(app: &AppHandle, paths: Vec<String>) {
    if paths.is_empty() {
        return;
    }
    let state = app.state::<LaunchFiles>();
    if let Ok(mut launch) = state.0.lock() {
        if !launch.taken {
            launch.paths.extend(paths);
            return;
        }
    }
    let _ = app.emit(OPEN_FILES_EVENT, paths);
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
