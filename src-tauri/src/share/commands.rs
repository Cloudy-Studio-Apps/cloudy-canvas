use std::time::{Duration, Instant};

use iroh::endpoint::presets;
use iroh::{Endpoint, EndpointAddr};
use serde::Serialize;
use tauri::ipc::{Channel, InvokeBody, InvokeResponseBody, Request};
use tauri::{AppHandle, State};

use super::relay::{relay_mode, RelaySettings};
use super::session::Session;
use super::{ShareState, ALPN};

/// How long a new host waits to be reachable through its relay before handing out its address.
const ONLINE_TIMEOUT: Duration = Duration::from_secs(15);
const CONNECT_TIMEOUT: Duration = Duration::from_secs(30);
const TEST_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Hosting {
    /// Where guests dial this app (iroh's `EndpointAddr`, as JSON): the webview puts it in links.
    addr: EndpointAddr,
    /// Reachable through the relay; `false` means only the local network may reach it.
    online: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RelayTest {
    ok: bool,
    /// How long coming online through the relay took.
    millis: Option<u64>,
    error: Option<String>,
}

/// Starts hosting as session `session` (ending any session this app is in). Frames from guests
/// arrive on `frames`.
#[tauri::command]
pub async fn share_host(
    app: AppHandle,
    state: State<'_, ShareState>,
    session: u32,
    relay: Option<RelaySettings>,
    frames: Channel<InvokeResponseBody>,
) -> Result<Hosting, String> {
    end_current(&state).await;
    let session = Session::bind(app, session, relay.as_ref(), true, frames).await?;
    session.accept_peers();
    let online = tokio::time::timeout(ONLINE_TIMEOUT, session.endpoint.online()).await.is_ok();
    let addr = session.endpoint.addr();
    state.replace(Some(session));
    Ok(Hosting { addr, online })
}

/// Joins the host at `addr` through `relay` (the host's, from the link) as session `session`;
/// returns the host's peer id.
#[tauri::command]
pub async fn share_join(
    app: AppHandle,
    state: State<'_, ShareState>,
    session: u32,
    addr: EndpointAddr,
    relay: Option<RelaySettings>,
    frames: Channel<InvokeResponseBody>,
) -> Result<u32, String> {
    end_current(&state).await;
    let session = Session::bind(app, session, relay.as_ref(), false, frames).await?;
    let connect = async {
        let conn = session.endpoint.connect(addr, ALPN).await.map_err(|e| e.to_string())?;
        let (send, recv) = conn.open_bi().await.map_err(|e| e.to_string())?;
        Ok::<_, String>(session.add_peer(conn, send, recv))
    };
    match tokio::time::timeout(CONNECT_TIMEOUT, connect).await {
        Ok(Ok(peer)) => {
            state.replace(Some(session));
            Ok(peer)
        }
        Ok(Err(error)) => {
            session.close().await;
            Err(error)
        }
        Err(_) => {
            session.close().await;
            Err("The host didn't answer".to_string())
        }
    }
}

/// Sends one frame to a peer: the raw body is the frame, the `session` and `peer` headers say
/// where it goes.
#[tauri::command]
pub fn share_send(state: State<'_, ShareState>, request: Request<'_>) -> Result<(), String> {
    let header = |name: &str| {
        request
            .headers()
            .get(name)
            .and_then(|value| value.to_str().ok())
            .and_then(|value| value.parse::<u32>().ok())
            .ok_or_else(|| format!("missing {name} header"))
    };
    let (session, peer) = (header("session")?, header("peer")?);
    let InvokeBody::Raw(frame) = request.body() else {
        return Err("expected a raw body".to_string());
    };
    let current = state.session(session).ok_or_else(|| "the session ended".to_string())?;
    current.send(peer, frame.clone())
}

#[tauri::command]
pub fn share_close_peer(state: State<'_, ShareState>, session: u32, peer: u32, reason: String) {
    if let Some(current) = state.session(session) {
        current.close_peer(peer, &reason);
    }
}

/// `"direct"`, `"relay"`, or `null` while there's no path yet.
#[tauri::command]
pub fn share_peer_path(state: State<'_, ShareState>, session: u32, peer: u32) -> Option<&'static str> {
    state.session(session)?.path(peer)
}

/// Ends session `session`, if it's still the current one: every peer is disconnected and the
/// endpoint closed.
#[tauri::command]
pub async fn share_stop(state: State<'_, ShareState>, session: u32) -> Result<(), String> {
    if let Some(current) = state.take(session) {
        current.close().await;
    }
    Ok(())
}

/// Checks that an endpoint comes online through `relay` (its URL, TLS and token are right).
#[tauri::command]
pub async fn share_relay_test(relay: RelaySettings) -> RelayTest {
    let mode = match relay_mode(Some(&relay)) {
        Ok(mode) => mode,
        Err(error) => return RelayTest { ok: false, millis: None, error: Some(error) },
    };
    let endpoint = match Endpoint::builder(presets::N0).relay_mode(mode).bind().await {
        Ok(endpoint) => endpoint,
        Err(error) => return RelayTest { ok: false, millis: None, error: Some(error.to_string()) },
    };
    let started = Instant::now();
    let online = tokio::time::timeout(TEST_TIMEOUT, endpoint.online()).await.is_ok();
    let millis = started.elapsed().as_millis() as u64;
    endpoint.close().await;
    if online {
        RelayTest { ok: true, millis: Some(millis), error: None }
    } else {
        RelayTest {
            ok: false,
            millis: None,
            error: Some("Couldn't connect through the relay in 10 s (check the URL, the token and the ports)".to_string()),
        }
    }
}

async fn end_current(state: &ShareState) {
    if let Some(previous) = state.replace(None) {
        previous.close().await;
    }
}
