use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use axum::response::sse::Event;
use tokio::sync::{mpsc, oneshot};

/// The webview's answer: the body (empty for none) and the MCP session to name in the response.
pub struct Reply {
    pub body: String,
    pub session: Option<String>,
}

/// Shared between the HTTP server and the Tauri commands: requests waiting for the webview's reply
/// and each session's open event stream (GET).
#[derive(Clone)]
pub struct McpState(Arc<Inner>);

struct Inner {
    url: Mutex<Option<String>>,
    enabled: AtomicBool,
    next_id: AtomicU64,
    pending: Mutex<HashMap<u64, oneshot::Sender<Reply>>>,
    /// Session → (stream id, sender). The id tells a replaced stream from the current one.
    streams: Mutex<HashMap<String, (u64, mpsc::UnboundedSender<Event>)>>,
}

impl McpState {
    pub fn new() -> Self {
        Self(Arc::new(Inner {
            url: Mutex::new(None),
            enabled: AtomicBool::new(true),
            next_id: AtomicU64::new(1),
            pending: Mutex::new(HashMap::new()),
            streams: Mutex::new(HashMap::new()),
        }))
    }

    pub fn url(&self) -> Option<String> {
        self.0.url.lock().ok()?.clone()
    }

    pub fn set_url(&self, url: String) {
        if let Ok(mut current) = self.0.url.lock() {
            *current = Some(url);
        }
    }

    pub fn enabled(&self) -> bool {
        self.0.enabled.load(Ordering::Relaxed)
    }

    pub fn set_enabled(&self, enabled: bool) {
        self.0.enabled.store(enabled, Ordering::Relaxed);
    }

    /// A new request id and the receiver its reply arrives on.
    pub fn register(&self) -> (u64, oneshot::Receiver<Reply>) {
        let id = self.0.next_id.fetch_add(1, Ordering::Relaxed);
        let (sender, receiver) = oneshot::channel();
        if let Ok(mut pending) = self.0.pending.lock() {
            pending.insert(id, sender);
        }
        (id, receiver)
    }

    pub fn resolve(&self, id: u64, reply: Reply) {
        let sender = self.0.pending.lock().ok().and_then(|mut pending| pending.remove(&id));
        if let Some(sender) = sender {
            let _ = sender.send(reply);
        }
    }

    pub fn cancel(&self, id: u64) {
        if let Ok(mut pending) = self.0.pending.lock() {
            pending.remove(&id);
        }
    }

    /// Opens `session`'s event stream, replacing any earlier one (whose receiver then ends).
    /// Returns the stream's id, for `close_stream`, and the receiver its events arrive on.
    pub fn open_stream(&self, session: String) -> (u64, mpsc::UnboundedReceiver<Event>) {
        let id = self.0.next_id.fetch_add(1, Ordering::Relaxed);
        let (sender, receiver) = mpsc::unbounded_channel();
        if let Ok(mut streams) = self.0.streams.lock() {
            streams.insert(session, (id, sender));
        }
        (id, receiver)
    }

    /// Forgets `session`'s stream if `id` is still the current one. True when it was removed.
    pub fn close_stream(&self, session: &str, id: u64) -> bool {
        let Ok(mut streams) = self.0.streams.lock() else { return false };
        if streams.get(session).is_some_and(|(current, _)| *current == id) {
            streams.remove(session);
            true
        } else {
            false
        }
    }

    /// Sends `event` down `session`'s stream. Without an open stream it's dropped.
    pub fn notify(&self, session: &str, event: Event) {
        if let Ok(streams) = self.0.streams.lock() {
            if let Some((_, sender)) = streams.get(session) {
                let _ = sender.send(event);
            }
        }
    }
}
