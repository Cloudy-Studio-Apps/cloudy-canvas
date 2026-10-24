use serde::Serialize;
use tauri::State;

use super::{McpState, Reply};

#[derive(Serialize)]
pub struct McpStatus {
    url: Option<String>,
    enabled: bool,
}

/// The webview's reply to request `id`; an empty body means there is no response (a notification).
/// `session` is sent back as the `Mcp-Session-Id` header (set when an agent connects).
#[tauri::command]
pub fn mcp_reply(state: State<'_, McpState>, id: u64, body: String, session: Option<String>) {
    state.resolve(id, Reply { body, session });
}

#[tauri::command]
pub fn mcp_status(state: State<'_, McpState>) -> McpStatus {
    McpStatus { url: state.url(), enabled: state.enabled() }
}

#[tauri::command]
pub fn mcp_set_enabled(state: State<'_, McpState>, enabled: bool) {
    state.set_enabled(enabled);
}
