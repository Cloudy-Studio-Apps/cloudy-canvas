//! The font faces installed on the computer, so the design editor can offer them. The webview
//! draws installed fonts by name, so listing needs only names, weights and styles; outlining
//! text (booleans, Flatten) reads a face's file. Which faces are shown, and how text is laid out
//! and shaped, is decided in TypeScript.

use std::sync::{Arc, OnceLock};

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
        database()
            .faces()
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

/// The installed faces, scanned once (scanning the font folders takes a moment).
fn database() -> Arc<fontdb::Database> {
    static DATABASE: OnceLock<Arc<fontdb::Database>> = OnceLock::new();
    DATABASE
        .get_or_init(|| {
            let mut db = fontdb::Database::new();
            db.load_system_fonts();
            Arc::new(db)
        })
        .clone()
}

/// The file of the installed face closest to `family`, `weight` and `italic`, for outlining its
/// glyphs. The response is the face's index in its file (a collection holds several) as four
/// little-endian bytes, then the file. Empty when the family isn't installed.
#[tauri::command]
pub async fn system_font_data(family: String, weight: u16, italic: bool) -> tauri::ipc::Response {
    let bytes = tauri::async_runtime::spawn_blocking(move || {
        let db = database();
        let families = [fontdb::Family::Name(&family)];
        let query = fontdb::Query {
            families: &families,
            weight: fontdb::Weight(weight),
            stretch: fontdb::Stretch::Normal,
            style: if italic { fontdb::Style::Italic } else { fontdb::Style::Normal },
        };
        let id = db.query(&query)?;
        db.with_face_data(id, |data, index| {
            let mut bytes = Vec::with_capacity(data.len() + 4);
            bytes.extend_from_slice(&index.to_le_bytes());
            bytes.extend_from_slice(data);
            bytes
        })
    })
    .await
    .ok()
    .flatten()
    .unwrap_or_default();
    tauri::ipc::Response::new(bytes)
}
