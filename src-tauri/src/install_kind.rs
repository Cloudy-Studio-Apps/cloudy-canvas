// How the running app was installed, so the frontend knows whether it can update itself.

/// `"installer"` (the Windows NSIS installer) and `"appimage"` replace themselves; `"package"`
/// (a .deb or pacman package) is updated by downloading the new package.
#[tauri::command]
pub fn install_kind() -> &'static str {
    if cfg!(windows) {
        "installer"
    } else if std::env::var_os("APPIMAGE").is_some() {
        "appimage"
    } else {
        "package"
    }
}
