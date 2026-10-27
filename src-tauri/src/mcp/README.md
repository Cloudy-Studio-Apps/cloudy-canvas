# Agent server transport

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Rust is only the transport

- **Rust is only the transport** (`src-tauri/src/mcp/`): Streamable HTTP (POST, plus DELETE to end a session). Each body is emitted to the webview as `mcp://message` with the agent's `Mcp-Session-Id` and User-Agent (`AgentMessage`) and answered through the `mcp_reply` command (30 s timeout), whose `session` becomes the response's `Mcp-Session-Id`. `mcp_status` and `mcp_set_enabled` back the UI.
