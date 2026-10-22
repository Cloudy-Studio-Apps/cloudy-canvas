//! The font faces installed on the computer, so the design editor can offer them. The webview
//! draws installed fonts by name, so only names, weights and styles are needed. Which of them are
//! shown, and how, is decided in TypeScript.

use serde::Serialize;

/// One installed face, as the font picker lists it.
#[derive(Serialize)]
pub struct SystemFont {
    family: String,
    weight: u16,
    italic: bool,
}

/// Every installed face (several per family). Scanning the font folders can take a moment, so it
/// runs off the main thread.
#[tauri::command]
pub async fn system_fonts() -> Vec<SystemFont> {
    tauri::async_runtime::spawn_blocking(|| {
        let mut db = fontdb::Database::new();
        db.load_system_fonts();
        db.faces()
            .filter_map(|face| {
                let (family, _) = face.families.first()?;
                Some(SystemFont {
                    family: family.clone(),
                    weight: face.weight.0,
                    italic: face.style != fontdb::Style::Normal,
                })
            })
            .collect()
    })
    .await
    .unwrap_or_default()
}
