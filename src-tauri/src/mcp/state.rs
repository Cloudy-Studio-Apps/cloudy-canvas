use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use tokio::sync::oneshot;

/// Shared between the HTTP server and the Tauri commands: requests waiting for the webview's reply.
#[derive(Clone)]
pub struct McpState(Arc<Inner>);

struct Inner {
    url: Mutex<Option<String>>,
    enabled: AtomicBool,
    next_id: AtomicU64,
    pending: Mutex<HashMap<u64, oneshot::Sender<String>>>,
}

impl McpState {
    pub fn new() -> Self {
        Self(Arc::new(Inner {
            url: Mutex::new(None),
            enabled: AtomicBool::new(true),
            next_id: AtomicU64::new(1),
            pending: Mutex::new(HashMap::new()),
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
    pub fn register(&self) -> (u64, oneshot::Receiver<String>) {
        let id = self.0.next_id.fetch_add(1, Ordering::Relaxed);
        let (sender, receiver) = oneshot::channel();
        if let Ok(mut pending) = self.0.pending.lock() {
            pending.insert(id, sender);
        }
        (id, receiver)
    }

    pub fn resolve(&self, id: u64, body: String) {
        let sender = self.0.pending.lock().ok().and_then(|mut pending| pending.remove(&id));
        if let Some(sender) = sender {
            let _ = sender.send(body);
        }
    }

    pub fn cancel(&self, id: u64) {
        if let Ok(mut pending) = self.0.pending.lock() {
            pending.remove(&id);
        }
    }
}
