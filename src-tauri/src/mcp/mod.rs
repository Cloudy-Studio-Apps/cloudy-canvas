//! Local MCP endpoint for agents (Claude Code, Cursor, …). This is only a transport: each HTTP
//! request is forwarded to the webview, where the MCP protocol and the tools live
//! (`src/core/mcp`, `src/engine/agent`), and the webview's reply becomes the HTTP response.

pub mod commands;
mod routes;
mod state;

use tauri::{AppHandle, Manager};

pub use state::{McpState, Reply};

/// Agents are configured with this port, so it's fixed; the next ones are tried if it's taken.
const PREFERRED_PORT: u16 = 47821;
const PORT_ATTEMPTS: u16 = 10;
const DISCOVERY_FILE: &str = "mcp.json";

/// Starts listening on 127.0.0.1 in the background. Failing to bind only disables the endpoint.
pub fn start(app: &AppHandle) {
    let app = app.clone();
    let state = app.state::<McpState>().inner().clone();
    tauri::async_runtime::spawn(async move {
        let Some((listener, port)) = bind().await else {
            eprintln!("[mcp] no free port in {PREFERRED_PORT}..{}", PREFERRED_PORT + PORT_ATTEMPTS);
            return;
        };
        let url = format!("http://127.0.0.1:{port}/mcp");
        state.set_url(url.clone());
        write_discovery_file(&app, &url);
        if let Err(error) = axum::serve(listener, routes::router(app, state, port)).await {
            eprintln!("[mcp] server stopped: {error}");
        }
    });
}

async fn bind() -> Option<(tokio::net::TcpListener, u16)> {
    for port in PREFERRED_PORT..PREFERRED_PORT + PORT_ATTEMPTS {
        if let Ok(listener) = tokio::net::TcpListener::bind(("127.0.0.1", port)).await {
            return Some((listener, port));
        }
    }
    None
}

/// Writes `{ "url": … }` to the app data folder so tools can find the endpoint if the port moved.
fn write_discovery_file(app: &AppHandle, url: &str) {
    let Ok(dir) = app.path().app_data_dir() else { return };
    let contents = serde_json::json!({ "url": url }).to_string();
    if let Err(error) = std::fs::create_dir_all(&dir).and_then(|_| std::fs::write(dir.join(DISCOVERY_FILE), contents)) {
        eprintln!("[mcp] couldn't write {DISCOVERY_FILE}: {error}");
    }
}
