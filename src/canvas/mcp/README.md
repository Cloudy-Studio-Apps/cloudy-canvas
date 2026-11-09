# MCP helpers

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Agent helpers

- **MCP helpers** (`canvas/mcp/`): `McpTool<H>` (generic over what the tool can reach), argument parsers (`tool-args.ts`), `asUndoStep(doc, edit)`, and `buildElement` / `elementPatch` / `summarizeElement`, which go through the kinds. Products assemble their MCP tools from these.
- **Tab tools** (`agent-tabs.ts`, `agent-tabs.types.ts`, `tabs.mcp.ts`): `list_tabs` and `switch_tab` on `TabsAgentHost`, and what the products' `open_*`/`new_*` tools share: `AgentFileRef`, `AgentNewFile`, the `AgentFileCandidates`/`AgentProjectChoice` answers, the name rules (`sameFileName`, `projectNameMatches`) and their argument parsers. The app implements the host (`app/mcp/`).

## Tool names

- **Full names** (`mcp-tool-name.ts`): a tool's `name` is local; the server lists it as `mcpToolName(prefix, local)`, `<prefix>_<local>`. `checkMcpToolName(name)` returns why a full name can't be served (outside `[a-z0-9_-]`, or longer than `MCP_TOOL_NAME_MAX`, 44, since agent apps add their own prefix), else `null`. `McpTool.scope` is `"app"` for a tool that needs no open file (`"file"` by default).
- **The prefix** (`mcpPrefixFor(group, owner, reserved)`, `mcp-prefix.ts`): the owner (`McpToolOwner`: module id, its `tier`, its plugin id; `mcpToolOwner(modules, point, groupId, pluginOf)` reads it with `ModuleHost.ownerOf`/`tierOf`) decides it. A plugin's tools take its plugin id, and are refused when its group declares a `prefix` or the id is in `reserved` (`The plugin id "<id>" is a built-in prefix.`); a core module's group must declare its topic (`McpToolGroup.prefix`), and a feature module's takes its module id and may not declare one. A built-in that breaks this throws, naming its module. `builtInPrefixes(modules, point)` is the reserved set of one product's point: the ids of the built-in modules contributing to it and the declared topics (the app joins both products').
- **Collecting** (`collectMcpTools(groups, context, ownerOf, reserved)`): one product's tools as `CollectedMcpTool`s (full name, tool, module id, plugin id) in group order, plus the plugins' `RefusedMcpTool`s (full name, plugin id, reason). An invalid name or one an earlier tool took throws for a built-in (`The module "<a>" adds an MCP tool that can't be served: "<name>" is the name of a tool of the module "<b>".`) and refuses a plugin's tool (e.g. `"<name>" is longer than 44 characters.`); a refused plugin never throws. The tab tools (`tabsTools`) aren't a module group yet: they keep their names and the app checks them with the products' tools.
