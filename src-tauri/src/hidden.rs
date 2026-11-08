//! Hides a file or folder in the file manager. Only Windows has a hidden attribute; elsewhere the
//! dot in the name (`.cloudy`) already hides it.

/// Sets the hidden attribute on `path` (Windows); does nothing on other platforms.
#[tauri::command]
pub fn set_hidden(path: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let status = std::process::Command::new("attrib")
            .args(["+h", &path])
            .creation_flags(CREATE_NO_WINDOW)
            .status()
            .map_err(|e| e.to_string())?;
        if !status.success() {
            return Err(format!("attrib +h failed for {path}"));
        }
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = path;
        Ok(())
    }
}
