use serde::Serialize;
use tauri::State;

use super::McpState;

#[derive(Serialize)]
pub struct McpStatus {
    url: Option<String>,
    enabled: bool,
}

/// The webview's reply to request `id`; an empty body means there is no response (a notification).
#[tauri::command]
pub fn mcp_reply(state: State<'_, McpState>, id: u64, body: String) {
    state.resolve(id, body);
}

#[tauri::command]
pub fn mcp_status(state: State<'_, McpState>) -> McpStatus {
    McpStatus { url: state.url(), enabled: state.enabled() }
}

#[tauri::command]
pub fn mcp_set_enabled(state: State<'_, McpState>, enabled: bool) {
    state.set_enabled(enabled);
}
