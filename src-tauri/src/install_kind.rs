// How the running app was installed, so the frontend knows whether it can update itself.

/// `"installer"` (the Windows NSIS installer, the macOS app) and `"appimage"` replace themselves;
/// `"package"` (a .deb or pacman package) is updated by downloading the new package.
#[tauri::command]
pub fn install_kind() -> &'static str {
    if cfg!(any(windows, target_os = "macos")) {
        "installer"
    } else if std::env::var_os("APPIMAGE").is_some() {
        "appimage"
    } else {
        "package"
    }
}
