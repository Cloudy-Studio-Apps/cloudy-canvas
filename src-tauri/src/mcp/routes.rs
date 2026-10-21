use std::time::Duration;

use axum::extract::{DefaultBodyLimit, State};
use axum::http::header::{CONTENT_TYPE, HOST, ORIGIN};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::Router;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use super::McpState;

const MESSAGE_EVENT: &str = "mcp://message";
const REPLY_TIMEOUT: Duration = Duration::from_secs(30);
const MAX_BODY_BYTES: usize = 8 * 1024 * 1024;

#[derive(Clone)]
struct Ctx {
    app: AppHandle,
    state: McpState,
    port: u16,
}

#[derive(Clone, Serialize)]
struct McpMessage {
    id: u64,
    body: String,
}

/// Streamable HTTP, stateless: POST carries JSON-RPC and gets a JSON reply. There is no session
/// and no server-initiated stream, so GET and DELETE get axum's automatic 405.
pub fn router(app: AppHandle, state: McpState, port: u16) -> Router {
    Router::new()
        .route("/mcp", post(handle_post))
        .layer(DefaultBodyLimit::max(MAX_BODY_BYTES))
        .with_state(Ctx { app, state, port })
}

async fn handle_post(State(ctx): State<Ctx>, headers: HeaderMap, body: String) -> Response {
    if !is_local_request(&headers, ctx.port) {
        return (StatusCode::FORBIDDEN, "Only local agents may connect").into_response();
    }
    if !ctx.state.enabled() {
        return (StatusCode::SERVICE_UNAVAILABLE, "The agent server is turned off in Cloudy Canvas")
            .into_response();
    }

    let (id, reply) = ctx.state.register();
    if ctx.app.emit(MESSAGE_EVENT, McpMessage { id, body }).is_err() {
        ctx.state.cancel(id);
        return StatusCode::SERVICE_UNAVAILABLE.into_response();
    }
    match tokio::time::timeout(REPLY_TIMEOUT, reply).await {
        Ok(Ok(body)) if body.is_empty() => StatusCode::ACCEPTED.into_response(),
        Ok(Ok(body)) => ([(CONTENT_TYPE, "application/json")], body).into_response(),
        _ => {
            ctx.state.cancel(id);
            (StatusCode::GATEWAY_TIMEOUT, "Cloudy Canvas didn't answer in time").into_response()
        }
    }
}

/// Guards against DNS rebinding: the Host must be the loopback address we listen on, and a browser
/// Origin (when sent) must be local too.
fn is_local_request(headers: &HeaderMap, port: u16) -> bool {
    let host = headers.get(HOST).and_then(|value| value.to_str().ok());
    let host_ok = host.is_some_and(|host| {
        host == format!("127.0.0.1:{port}") || host == format!("localhost:{port}")
    });
    let origin_ok = match headers.get(ORIGIN) {
        None => true,
        Some(value) => value.to_str().is_ok_and(is_local_origin),
    };
    host_ok && origin_ok
}

fn is_local_origin(origin: &str) -> bool {
    let Some(rest) = origin.strip_prefix("http://").or_else(|| origin.strip_prefix("https://"))
    else {
        return false;
    };
    if rest.starts_with("[::1]") {
        return rest == "[::1]" || rest.starts_with("[::1]:");
    }
    let host = rest.split_once(':').map_or(rest, |(host, _)| host);
    host == "127.0.0.1" || host == "localhost"
}
