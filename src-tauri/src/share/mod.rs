//! Live sessions' transport: the person sharing a file hosts it from their own app, and guests
//! connect to it peer to peer (iroh: QUIC dialed by public key, NAT hole punching, a relay when a
//! direct path can't be made). This is only a transport: each peer is a stream of frames handed
//! to the webview, where the session protocol and the sync live (`src/shared/core/share`,
//! `src/canvas/share`), and the webview's frames are written back to the peer.

pub mod commands;
mod framing;
mod relay;
mod session;
mod state;

pub use state::ShareState;

/// The protocol name both ends must agree on; a new wire format gets a new one.
const ALPN: &[u8] = b"cloudy-canvas/share/1";
