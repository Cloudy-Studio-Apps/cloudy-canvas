# MCP protocol

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

## The protocol is TypeScript

- **The protocol is TypeScript.** `shared/core/mcp/handle-mcp-message.ts` is a small hand-written JSON-RPC handler (`initialize`, `ping`, `tools/list`, `tools/call`). It reaches the platform through the `AgentChannel` interface (`shared/core/agent-channel.types.ts`, `platform/tauri-agent-channel.ts`), and `agentChannel` is `null` outside Tauri. `initialize` announces `tools: { listChanged: true }`; `tools/list` gives `server.toolsFor(context)` when the server defines it (a list per caller, see [app/mcp](../../../app/mcp/README.md#tool-lists-per-session)), else `server.tools`, while `tools/call` looks a tool up in `server.tools`, so a tool left out of a caller's list can still be called. Notifications to an agent (`notifications/tools/list_changed`) go down its event stream with `AgentChannel.notify`.
