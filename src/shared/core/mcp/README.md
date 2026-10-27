# MCP protocol

_How it works. The rules are in the root [CLAUDE.md](../../../../CLAUDE.md)._

## The protocol is TypeScript

- **The protocol is TypeScript.** `shared/core/mcp/handle-mcp-message.ts` is a small hand-written JSON-RPC handler (`initialize`, `ping`, `tools/list`, `tools/call`). It reaches the platform through the `AgentChannel` interface (`shared/core/agent-channel.types.ts`, `platform/tauri-agent-channel.ts`), and `agentChannel` is `null` outside Tauri.
