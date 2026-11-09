use std::convert::Infallible;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::Duration;

use axum::extract::{DefaultBodyLimit, State};
use axum::http::header::{HeaderName, CONTENT_TYPE, HOST, ORIGIN, USER_AGENT};
use axum::http::{HeaderMap, StatusCode};
use axum::response::sse::{Event, KeepAlive, Sse};
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::Router;
use serde::Serialize;
use tauri::{AppHandle, Emitter};
use tokio_stream::wrappers::UnboundedReceiverStream;
use tokio_stream::Stream;

use super::McpState;

const MESSAGE_EVENT: &str = "mcp://message";
const REPLY_TIMEOUT: Duration = Duration::from_secs(30);
const MAX_BODY_BYTES: usize = 8 * 1024 * 1024;
const SESSION_HEADER: HeaderName = HeaderName::from_static("mcp-session-id");
const KEEP_ALIVE_INTERVAL: Duration = Duration::from_secs(15);

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
    /// The session's event stream (GET) `"opened"` or `"closed"`; left out otherwise.
    #[serde(skip_serializing_if = "Option::is_none")]
    stream: Option<&'static str>,
}

/// Streamable HTTP: POST carries JSON-RPC and gets a JSON reply. Sessions tell agents apart (the
/// webview names them); GET opens a session's event stream, which carries what the webview sends
/// with `mcp_notify`.
pub fn router(app: AppHandle, state: McpState, port: u16) -> Router {
    Router::new()
        .route("/mcp", post(handle_post).get(handle_get).delete(handle_delete))
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
    if ctx.app.emit(MESSAGE_EVENT, message(id, body, &headers, false, None)).is_err() {
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
    let _ = ctx.app.emit(MESSAGE_EVENT, message(0, String::new(), &headers, true, None));
    StatusCode::OK.into_response()
}

/// An agent keeping its session's event stream open. The webview hears it opened and, once the
/// agent disconnects (the stream is dropped), closed. A second GET replaces the first stream.
async fn handle_get(State(ctx): State<Ctx>, headers: HeaderMap) -> Response {
    if !is_local_request(&headers, ctx.port) {
        return (StatusCode::FORBIDDEN, "Only local agents may connect").into_response();
    }
    if !ctx.state.enabled() {
        return (StatusCode::SERVICE_UNAVAILABLE, "The agent server is turned off in Cloudy Canvas")
            .into_response();
    }
    let Some(session) = headers
        .get(SESSION_HEADER)
        .and_then(|value| value.to_str().ok())
        .filter(|session| !session.is_empty())
        .map(str::to_owned)
    else {
        return (StatusCode::BAD_REQUEST, "Missing Mcp-Session-Id").into_response();
    };

    let (id, receiver) = ctx.state.open_stream(session.clone());
    let opened = message(0, String::new(), &headers, false, Some("opened"));
    let closed = message(0, String::new(), &headers, false, Some("closed"));
    let _ = ctx.app.emit(MESSAGE_EVENT, opened);
    let guard = StreamGuard { app: ctx.app, state: ctx.state, session, id, closed: Some(closed) };
    let events = UnboundedReceiverStream::new(receiver);
    let stream = SessionStream { events, _guard: Box::new(guard) };
    Sse::new(stream).keep_alive(KeepAlive::new().interval(KEEP_ALIVE_INTERVAL)).into_response()
}

/// A session's events, as the SSE body reads them. Dropped with the response body when the agent
/// disconnects, which drops its guard.
struct SessionStream {
    events: UnboundedReceiverStream<Event>,
    // Boxed so the stream is `Unpin` whatever the guard holds.
    _guard: Box<StreamGuard>,
}

impl Stream for SessionStream {
    type Item = Result<Event, Infallible>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        Pin::new(&mut self.events).poll_next(cx).map(|event| event.map(Ok))
    }
}

/// Forgets the session's sender when its stream ends and tells the webview, unless a newer GET
/// already replaced it (then the session still has a stream).
struct StreamGuard {
    app: AppHandle,
    state: McpState,
    session: String,
    id: u64,
    closed: Option<McpMessage>,
}

impl Drop for StreamGuard {
    fn drop(&mut self) {
        if self.state.close_stream(&self.session, self.id) {
            if let Some(closed) = self.closed.take() {
                let _ = self.app.emit(MESSAGE_EVENT, closed);
            }
        }
    }
}

fn message(
    id: u64,
    body: String,
    headers: &HeaderMap,
    ended: bool,
    stream: Option<&'static str>,
) -> McpMessage {
    let header = |name: &HeaderName| {
        headers.get(name).and_then(|value| value.to_str().ok()).map(str::to_owned)
    };
    McpMessage {
        id,
        body,
        session: header(&SESSION_HEADER),
        user_agent: header(&USER_AGENT),
        ended,
        stream,
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
