# Agent server transport

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Rust is only the transport

- **Rust is only the transport** (`src-tauri/src/mcp/`): Streamable HTTP (POST, GET for a session's event stream, DELETE to end a session). Each body is emitted to the webview as `mcp://message` with the agent's `Mcp-Session-Id` and User-Agent (`AgentMessage`) and answered through the `mcp_reply` command (30 s timeout), whose `session` becomes the response's `Mcp-Session-Id`. `mcp_status` and `mcp_set_enabled` back the UI. On mobile `start` does nothing: no port is opened.
- **Event streams** (GET, Server-Sent Events): an agent that sends GET with its `Mcp-Session-Id` (same local and enabled checks as POST; 400 without a session) keeps a `text/event-stream` open, with a keep-alive comment every 15 s. `McpState` holds one sender per session; a second GET replaces the first, whose stream then ends. The webview hears `mcp://message` with `stream: "opened"`, and `stream: "closed"` once the agent disconnects (a guard on the stream removes the sender when the response body is dropped; a replaced stream emits nothing). The `mcp_notify` command writes one `event: message` / `data: <body>` to the session's stream, and does nothing (no error) when the session has none. Which notifications to send, and when, is decided in TypeScript.
