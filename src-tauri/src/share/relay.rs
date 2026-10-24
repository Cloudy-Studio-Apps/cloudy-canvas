use iroh::{RelayConfig, RelayMap, RelayMode, RelayUrl};
use serde::{Deserialize, Serialize};

/// A relay the webview picked: the user's own server (and its access token).
#[derive(Clone, Deserialize, Serialize)]
pub struct RelaySettings {
    pub url: String,
    pub token: Option<String>,
}

/// The relays an endpoint uses: only the given one, so a test shows whether it works, or n0's
/// public relays when none is given.
pub fn relay_mode(relay: Option<&RelaySettings>) -> Result<RelayMode, String> {
    let Some(relay) = relay else { return Ok(RelayMode::Default) };
    let url: RelayUrl = relay.url.trim().parse().map_err(|e| format!("Invalid relay URL: {e}"))?;
    let mut config = RelayConfig::from(url);
    if let Some(token) = relay.token.as_deref().map(str::trim).filter(|t| !t.is_empty()) {
        config = config.with_auth_token(token);
    }
    Ok(RelayMode::Custom(RelayMap::from(config)))
}
