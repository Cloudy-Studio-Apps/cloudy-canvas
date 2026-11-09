# MCP helpers

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Agent helpers

- **MCP helpers** (`canvas/mcp/`): `McpTool<H>` (generic over what the tool can reach), argument parsers (`tool-args.ts`), `asUndoStep(doc, edit)`, and `buildElement` / `elementPatch` / `summarizeElement`, which go through the kinds. Products assemble their MCP tools from these.
- **Tab tools** (`agent-tabs.ts`, `agent-tabs.types.ts`, `tabs.mcp.ts`): `list_tabs` and `switch_tab` on `TabsAgentHost`, and what the products' `open_*`/`new_*` tools share: `AgentFileRef`, `AgentNewFile`, the `AgentFileCandidates`/`AgentProjectChoice` answers, the name rules (`sameFileName`, `projectNameMatches`) and their argument parsers. The app implements the host (`app/mcp/`).
