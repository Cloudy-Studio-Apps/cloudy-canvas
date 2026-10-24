use std::time::Duration;

use axum::extract::{DefaultBodyLimit, State};
use axum::http::header::{HeaderName, CONTENT_TYPE, HOST, ORIGIN, USER_AGENT};
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
const SESSION_HEADER: HeaderName = HeaderName::from_static("mcp-session-id");

#[derive(Clone)]
struct Ctx {
    app: AppHandle,
    state: McpState,
    port: u16,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct McpMessage {
    id: u64,
    body: String,
    /// The `Mcp-Session-Id` the agent sent: which agent this is.
    session: Option<String>,
    user_agent: Option<String>,
    /// The agent ended its session (DELETE).
    ended: bool,
}

/// Streamable HTTP: POST carries JSON-RPC and gets a JSON reply. Sessions only tell agents apart
/// (the webview names them); there is no server-initiated stream, so GET gets axum's automatic 405.
pub fn router(app: AppHandle, state: McpState, port: u16) -> Router {
    Router::new()
        .route("/mcp", post(handle_post).delete(handle_delete))
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
    if ctx.app.emit(MESSAGE_EVENT, message(id, body, &headers, false)).is_err() {
        ctx.state.cancel(id);
        return StatusCode::SERVICE_UNAVAILABLE.into_response();
    }
    match tokio::time::timeout(REPLY_TIMEOUT, reply).await {
        Ok(Ok(reply)) => {
            let mut response = if reply.body.is_empty() {
                StatusCode::ACCEPTED.into_response()
            } else {
                ([(CONTENT_TYPE, "application/json")], reply.body).into_response()
            };
            if let Some(value) = reply.session.and_then(|session| session.parse().ok()) {
                response.headers_mut().insert(SESSION_HEADER, value);
            }
            response
        }
        _ => {
            ctx.state.cancel(id);
            (StatusCode::GATEWAY_TIMEOUT, "Cloudy Canvas didn't answer in time").into_response()
        }
    }
}

/// An agent ending its session: the webview is told so it stops showing it. Nothing to wait for.
async fn handle_delete(State(ctx): State<Ctx>, headers: HeaderMap) -> Response {
    if !is_local_request(&headers, ctx.port) {
        return (StatusCode::FORBIDDEN, "Only local agents may connect").into_response();
    }
    let _ = ctx.app.emit(MESSAGE_EVENT, message(0, String::new(), &headers, true));
    StatusCode::OK.into_response()
}

fn message(id: u64, body: String, headers: &HeaderMap, ended: bool) -> McpMessage {
    let header = |name: &HeaderName| {
        headers.get(name).and_then(|value| value.to_str().ok()).map(str::to_owned)
    };
    McpMessage { id, body, session: header(&SESSION_HEADER), user_agent: header(&USER_AGENT), ended }
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
