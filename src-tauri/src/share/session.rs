use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{Arc, Mutex};

use iroh::endpoint::{presets, Connection, ConnectionError, RecvStream, SendStream};
use iroh::Endpoint;
use serde::Serialize;
use tauri::ipc::{Channel, InvokeResponseBody};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;

use super::framing::{read_frame, write_frame};
use super::relay::{relay_mode, RelaySettings};
use super::ALPN;

const CONNECTED_EVENT: &str = "share://connected";
const CLOSED_EVENT: &str = "share://closed";

#[derive(Clone, Serialize)]
struct Connected {
    session: u32,
    peer: u32,
}

#[derive(Clone, Serialize)]
struct Closed {
    session: u32,
    peer: u32,
    /// `closed`: the other side (or this one) closed it; `lost`: the network dropped it.
    kind: &'static str,
    /// The reason the closing side gave, or what went wrong.
    message: String,
}

struct Peer {
    conn: Connection,
    outbox: mpsc::UnboundedSender<Vec<u8>>,
}

/// One live session's endpoint and the peers connected to it (a host's guests, or a guest's
/// host). Frames from every peer go to one webview channel, each prefixed with its peer id
/// (u32, big endian). `id` is the webview's: its events say which session they're about.
#[derive(Clone)]
pub struct Session {
    pub id: u32,
    pub endpoint: Endpoint,
    peers: Arc<Mutex<HashMap<u32, Peer>>>,
    next_peer: Arc<AtomicU32>,
    frames: Channel<InvokeResponseBody>,
    app: AppHandle,
}

impl Session {
    /// A new endpoint with a fresh key (so an old session's link can't reach a new one). `accept`
    /// makes it take incoming connections (a host).
    pub async fn bind(
        app: AppHandle,
        id: u32,
        relay: Option<&RelaySettings>,
        accept: bool,
        frames: Channel<InvokeResponseBody>,
    ) -> Result<Self, String> {
        let mut builder = Endpoint::builder(presets::N0).relay_mode(relay_mode(relay)?);
        if accept {
            builder = builder.alpns(vec![ALPN.to_vec()]);
        }
        let endpoint = builder.bind().await.map_err(|e| e.to_string())?;
        Ok(Self {
            id,
            endpoint,
            peers: Arc::new(Mutex::new(HashMap::new())),
            next_peer: Arc::new(AtomicU32::new(1)),
            frames,
            app,
        })
    }

    /// Takes incoming connections until the endpoint closes; each one's first stream is its peer.
    pub fn accept_peers(&self) {
        let session = self.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(incoming) = session.endpoint.accept().await {
                let session = session.clone();
                tauri::async_runtime::spawn(async move {
                    let Ok(conn) = incoming.await else { return };
                    if let Ok((send, recv)) = conn.accept_bi().await {
                        session.add_peer(conn, send, recv);
                    }
                });
            }
        });
    }

    /// Registers a connection's stream as a peer, tells the webview, and starts moving its frames.
    pub fn add_peer(&self, conn: Connection, mut send: SendStream, mut recv: RecvStream) -> u32 {
        let id = self.next_peer.fetch_add(1, Ordering::Relaxed);
        let (outbox, mut queued) = mpsc::unbounded_channel::<Vec<u8>>();
        if let Ok(mut peers) = self.peers.lock() {
            peers.insert(id, Peer { conn: conn.clone(), outbox });
        }
        let _ = self.app.emit(CONNECTED_EVENT, Connected { session: self.id, peer: id });

        // Writes what the webview sends, in order.
        let writer_conn = conn.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(frame) = queued.recv().await {
                if write_frame(&mut send, &frame).await.is_err() {
                    writer_conn.close(1u32.into(), b"write failed");
                    return;
                }
            }
            let _ = send.finish();
        });

        // Hands what arrives to the webview.
        let frames = self.frames.clone();
        let reader_conn = conn.clone();
        tauri::async_runtime::spawn(async move {
            loop {
                match read_frame(&mut recv).await {
                    Ok(Some(payload)) => {
                        let mut tagged = Vec::with_capacity(4 + payload.len());
                        tagged.extend_from_slice(&id.to_be_bytes());
                        tagged.extend_from_slice(&payload);
                        if frames.send(InvokeResponseBody::Raw(tagged)).is_err() {
                            reader_conn.close(1u32.into(), b"app closed");
                            return;
                        }
                    }
                    Ok(None) => return,
                    Err(_) => {
                        reader_conn.close(1u32.into(), b"read failed");
                        return;
                    }
                }
            }
        });

        // Reports the end of the connection once, however it ends.
        let session = self.clone();
        tauri::async_runtime::spawn(async move {
            let (kind, message) = describe(conn.closed().await);
            if let Ok(mut peers) = session.peers.lock() {
                peers.remove(&id);
            }
            let event = Closed { session: session.id, peer: id, kind, message };
            let _ = session.app.emit(CLOSED_EVENT, event);
        });

        id
    }

    pub fn send(&self, peer: u32, frame: Vec<u8>) -> Result<(), String> {
        let peers = self.peers.lock().map_err(|_| "session lock poisoned".to_string())?;
        let peer = peers.get(&peer).ok_or_else(|| format!("no peer {peer}"))?;
        peer.outbox.send(frame).map_err(|_| "peer closed".to_string())
    }

    pub fn close_peer(&self, peer: u32, reason: &str) {
        if let Some(peer) = self.peers.lock().ok().and_then(|peers| peers.get(&peer).map(|p| p.conn.clone())) {
            peer.close(0u32.into(), reason.as_bytes());
        }
    }

    /// `direct` once hole punching found a path, `relay` while the relay carries it.
    pub fn path(&self, peer: u32) -> Option<&'static str> {
        let conn = self.peers.lock().ok()?.get(&peer)?.conn.clone();
        let paths = conn.paths();
        let selected = paths.iter().find(|path| path.is_selected())?;
        Some(if selected.is_relay() { "relay" } else { "direct" })
    }

    /// Closes every connection (sending what's queued first) and the endpoint.
    pub async fn close(&self) {
        self.endpoint.close().await;
    }
}

fn describe(error: ConnectionError) -> (&'static str, String) {
    match error {
        ConnectionError::ApplicationClosed(close) => {
            ("closed", String::from_utf8_lossy(&close.reason).into_owned())
        }
        ConnectionError::LocallyClosed => ("closed", String::new()),
        other => ("lost", other.to_string()),
    }
}
