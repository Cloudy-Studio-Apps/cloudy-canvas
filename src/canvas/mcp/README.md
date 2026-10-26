# MCP helpers

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Agent helpers

- **MCP helpers** (`canvas/mcp/`): `McpTool<H>` (generic over what the tool can reach), argument parsers (`tool-args.ts`), `asUndoStep(doc, edit)`, and `buildElement` / `elementPatch` / `summarizeElement`, which go through the kinds. Products assemble their MCP tools from these.
