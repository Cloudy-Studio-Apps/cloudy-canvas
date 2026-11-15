//! Flushes a written file to the disk, so a power cut right after can't lose it once the app has
//! acted on it being there (a page split removes the page from its design only after this).

use std::fs::OpenOptions;

/// Resolves once `path`'s bytes, and on Unix its entry in its folder, are on the disk.
#[tauri::command]
pub async fn sync_file(path: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || sync(&path).map_err(|e| format!("{path}: {e}")))
        .await
        .map_err(|e| e.to_string())?
}

fn sync(path: &str) -> std::io::Result<()> {
    // Windows flushes only through a handle that may write.
    OpenOptions::new().write(true).open(path)?.sync_all()?;
    sync_folder(path)
}

/// A new file's name lives in its folder: flush the folder too, or the file can vanish.
#[cfg(unix)]
fn sync_folder(path: &str) -> std::io::Result<()> {
    match std::path::Path::new(path).parent() {
        Some(dir) if !dir.as_os_str().is_empty() => std::fs::File::open(dir)?.sync_all(),
        _ => Ok(()),
    }
}

/// Windows can't open a folder to flush it; NTFS journals the new name itself.
#[cfg(not(unix))]
fn sync_folder(_path: &str) -> std::io::Result<()> {
    Ok(())
}
