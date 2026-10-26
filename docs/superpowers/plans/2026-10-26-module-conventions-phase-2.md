# Module conventions, phase 2 (MCP rename) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** every file that defines MCP tools is a `.mcp.ts` (one per module, or `mcp/<topic>.mcp.ts`),
the tool plumbing lives in `canvas/mcp` and `products/*/mcp`, the board's general tools live in its
core module, and the types and points say "MCP" (`McpTool`, `designMcpTools`, `api.*.mcpTools`).
Behavior doesn't change: agents see exactly the same tools.

**Architecture:** Mechanical, done by scripts so nothing is missed: (1) move and rename files and
folders from an explicit map, rewriting every relative import by resolving it against the map;
(2) rename symbols with word-boundary replacements from an explicit list; (3) update the docs with the
same maps. `pnpm typecheck` is the main gate for (1) and (2); a before/after list of tool names proves
agents see the same tools.

**Tech Stack:** TypeScript, a throwaway Python script in the scratchpad, `pnpm typecheck`/`lint`/
`format:check`.

**Spec:** `docs/superpowers/specs/2026-10-25-module-conventions-design.md` (§3.1, §3.2, §6, §7.3,
§12 phase 2, §13 decisions 4 and 7).

## Global Constraints

- Agents see the **same tools**: MCP tool names, schemas and behavior unchanged (tool names are a
  separate plan, spec §13 decision 7).
- **"Agent" stays for the actor**: `AgentHost`, `DesignAgentHost`, `AgentFile`, `agentPatches`,
  `canvas-ui/agent/` (`useAgentFile`), `products/*/ui/agent/` (`useAgentBoard`, `useAgentDesign`),
  `app/mcp/agent-*` (presence, host, undo notes, tool catalog) and `shared/agent-server/` keep their
  names. Only what defines or collects **tools** changes.
- Plugin API stays **v1**, no aliases: `api.board.agentTools` → `api.board.mcpTools`,
  `api.design.agentTools` → `api.design.mcpTools`; `examples/plugins/` and `docs/plugins.md` updated
  in the same phase.
- Files are moved with `mv` (not `git mv`): git is the user's; renames show up when they commit.
- No behavior or code changes beyond names, paths and the board core's new `mcp/index.ts` (and the
  three new `mcp/index.ts` of image, layers and pages).
- The import from board core's tools into the `geo` and `er` features (`create-shapes`, `apply-result`)
  is **kept** in this phase: it's a core → feature import the import rules forbid, fixed in phase 5.
  The Transition table gains it.
- Verification: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, plus this plan's greps. Ends with
  a commit message for the user.

## Review Focus

1. **An import the rewrite didn't resolve** (a barrel re-export, a `../../agent` from a module's `ui/`,
   an `export * from "./agent"` in `@board`/`@design`): `pnpm typecheck` must pass with zero errors.
2. **A word-boundary rename hitting something unrelated** (`AgentToolsDialog`, `agentToolCatalog`,
   "Agent tools" UI text): the rename prints every match before writing, and the excluded paths are
   listed.
3. **Agents losing or gaining a tool**: the list of tool names (`name: "…"` in tool files) before and
   after is identical.
4. **A plugin breaking silently**: the example plugin uses `api.board.mcpTools`, and `strictApi`
   throws on the old name with a clear message (it already names missing keys).
5. **Docs still naming the old files** (`*.agent-tools.ts`, `agent/` folders, `AgentTool`): a grep
   over `CLAUDE.md`, `docs/modules.md`, `docs/plugins.md` and every `README.md` finds none.

---

## The map

Paths under `src/`. "→ folder/" renames the folder; files inside keep their names unless listed.

**Engine:** `canvas/agent/` → `canvas/mcp/`, with `agent-tool.types.ts` → `mcp-tool.types.ts`,
`agent-tool-group.types.ts` → `mcp-tool-group.types.ts`, `collect-agent-tools.ts` →
`collect-mcp-tools.ts`, `arrange-tools.ts` → `arrange.mcp.ts`, `arrange-tools.types.ts` →
`arrange.mcp.types.ts`, `scale-tool.ts` → `scale.mcp.ts`, `style-tool.ts` → `style.mcp.ts`
(`tokens/`, `agent-patches.ts`, `agent-file.types.ts`, the helpers and `README.md` move with the folder).

**Board plumbing:** `products/board/agent/` → `products/board/mcp/`, with `agent-instructions.ts` →
`mcp-instructions.ts`, `board-agent.types.ts` → `board-mcp.types.ts`, `create-agent-tools.ts` →
`create-mcp-tools.ts` (`apply-result.ts`, `board-access.ts`, `index.ts`, `README.md` stay in it).

**Board core's tools:** out of `products/board/agent/` into `products/board/modules/core/mcp/`:
`board-read-tools.ts` → `board-read.mcp.ts`, `board-info-tools.ts` → `board-info.mcp.ts`,
`create-shapes-tool.ts` → `create-shapes.mcp.ts`, `shape-edit-tools.ts` → `shape-edit.mcp.ts`,
`arrange-tools.ts` → `arrange.mcp.ts`, `view-tools.ts` → `view.mcp.ts`, `export-tools.ts` →
`export.mcp.ts`, `file-tools.ts` → `file.mcp.ts`, `plugin-tools.ts` → `plugins.mcp.ts`; plus a new
`mcp/index.ts` exporting them (the lines `products/board/agent/index.ts` had for them, which leave it).

**Design plumbing:** `products/design/agent/` → `products/design/mcp/`, with `design-agent.types.ts`
→ `design-mcp.types.ts`, `design-agent-instructions.ts` → `mcp-instructions.ts`,
`create-design-agent-tools.ts` → `create-mcp-tools.ts`.

**Module folders** `agent/` → `mcp/`, every `*.agent-tools.ts`/`*.agent-tool.ts` inside →
`*.mcp.ts`: board `colors`; design `core`, `catalog`, `styleguide` (also `styleguide-agent.types.ts`
→ `styleguide-mcp.types.ts`), `variables`.

**Single files** `<name>.agent-tools.ts` → `<name>.mcp.ts`: board `db`, `er`, `sticker`; design
`auto-layout`, `boolean`, `frame`, `group`, `mask`, `sticker`, `text`, `vector`. Board sticker's
`agent-stickers.ts` → `mcp-stickers.ts`.

**Two or more files → a new `mcp/` folder** with an `index.ts` exporting what the module file
imports: design `image` (`image.agent-tools.ts` → `mcp/add-image.mcp.ts`,
`placeholder.agent-tool.ts` → `mcp/placeholder.mcp.ts`, `replace-image.agent-tool.ts` →
`mcp/replace-image.mcp.ts`), `layers` (`layers.agent-tools.ts` → `mcp/layer-tree.mcp.ts`,
`move-layers.agent-tool.ts` → `mcp/move-layers.mcp.ts`), `pages` (`pages.agent-tools.ts` →
`mcp/pages.mcp.ts`, `guides.agent-tools.ts` → `mcp/guides.mcp.ts`).

Any sibling `<old>.types.ts` of a moved file follows it as `<new>.types.ts`.

**Symbols** (word boundaries; in this order, so the protocol's name is free first):

| Old                                                   | New                                                 |
| ----------------------------------------------------- | --------------------------------------------------- |
| `McpTool` (protocol, `shared/core/mcp`, `app/mcp`)    | `McpServerTool`                                     |
| `AgentTool`, `AgentToolGroup`                         | `McpTool`, `McpToolGroup`                           |
| `BoardAgentTool`, `BoardAgentToolGroup`               | `BoardMcpTool`, `BoardMcpToolGroup`                 |
| `DesignAgentTool`, `DesignAgentToolGroup`             | `DesignMcpTool`, `DesignMcpToolGroup`               |
| `boardAgentTools`, `designAgentTools`                 | `boardMcpTools`, `designMcpTools`                   |
| point ids `"board.agentTools"`, `"design.agentTools"` | `"board.mcpTools"`, `"design.mcpTools"`             |
| `collectAgentTools`                                   | `collectMcpTools`                                   |
| `createAgentTools`, `createDesignAgentTools`          | `createBoardMcpTools`, `createDesignMcpTools`       |
| `AGENT_INSTRUCTIONS`, `DESIGN_AGENT_INSTRUCTIONS`     | `BOARD_MCP_INSTRUCTIONS`, `DESIGN_MCP_INSTRUCTIONS` |
| `agentTools` key in `PluginApi` (`board`, `design`)   | `mcpTools`                                          |

---

### Task 1: Move the files and rewrite their imports

**Files:** everything in The map; every `.ts`/`.tsx` under `src/` whose relative imports point at a
moved file.

**Interfaces:**

- Produces: the new paths of The map; `products/board/modules/core/mcp/index.ts` exporting
  `boardReadTools`, `boardInfoTools`, `createShapesTool`, `shapeEditTools`, `arrangeTools`,
  `viewTools`, `exportTools`, `fileTools`, `pluginTools`; `image/mcp`, `layers/mcp`, `pages/mcp`
  `index.ts` exporting what their module files import.

- [ ] **Step 1: Record the tool names before.**
      Run: `grep -rhoE 'name: "[a-z_]+"' src --include='*.ts' | sort > <scratchpad>/tools.before.txt; wc -l <scratchpad>/tools.before.txt`
- [ ] **Step 2: Write `<scratchpad>/phase2_move.py`.** It holds The map as `{old path: new path}`
      (files; folder renames expanded into their files), moves each with `os.rename` (creating folders),
      then for every `.ts`/`.tsx` under `src/` rewrites each relative specifier (`from "…"`,
      `import("…")`, `export … from "…"`): resolve it against the file's **old** location to an old target
      (`<p>.ts`, `<p>.tsx`, `<p>/index.ts`), map file and target through the map, and write the new
      relative specifier (keeping `/index` implicit and dropping extensions as before). Specifiers that
      don't resolve to a moved file only change when the importing file moved. It prints every changed
      specifier.
- [ ] **Step 3: Write the four new `mcp/index.ts` files** (board core, image, layers, pages) and point
      `core.module.ts`, `image.module.ts`, `layers.module.ts`, `pages.module.ts` at `./mcp` / `"./mcp"`;
      remove the tool exports from `products/board/mcp/index.ts`.
- [ ] **Step 4: Check.**
      Run: `pnpm typecheck` — Expected: no errors. Then
      `find src -name '*.agent-tool*.ts'; find src -type d -name agent -not -path '*/ui/*' -not -path '*/canvas-ui/*'` — Expected: no output.
      Then `grep -rhoE 'name: "[a-z_]+"' src --include='*.ts' | sort | diff <scratchpad>/tools.before.txt -` — Expected: no differences.

### Task 2: Rename the symbols and the plugin API

**Files:** every `.ts`/`.tsx` under `src/` using a symbol of the table; `app/plugins/create-plugin-api.ts`,
`app/plugins/plugin-api.types.ts`; `examples/plugins/*/main.js`.

**Interfaces:**

- Consumes: the paths of Task 1.
- Produces: the names of the Symbols table, used by Task 3's docs.

- [ ] **Step 1: Rename `McpTool` → `McpServerTool`** in `src/shared/core/mcp/` and `src/app/mcp/` only
      (word boundary), before anything else.
- [ ] **Step 2: Rename the rest of the table** with word-boundary replacements over `src/` and
      `examples/plugins/`, excluding `src/shared/agent-server/` and `src/app/mcp/agent-tool-catalog*`
      (UI names). Print each file and count first; a match in an excluded or unexpected place stops it.
- [ ] **Step 3: Plugin API keys.** In `create-plugin-api.ts` and `plugin-api.types.ts`, `agentTools:`
      → `mcpTools:` under `board` and `design`; in `examples/plugins/callout/main.js`,
      `board.agentTools` → `board.mcpTools` (and any other example using it).
- [ ] **Step 4: Check.**
      Run: `pnpm typecheck && pnpm lint` — Expected: pass. Then
      `grep -rnwE 'AgentTool|AgentToolGroup|BoardAgentTool|DesignAgentTool|boardAgentTools|designAgentTools|collectAgentTools|createAgentTools|createDesignAgentTools|AGENT_INSTRUCTIONS|DESIGN_AGENT_INSTRUCTIONS' src examples` — Expected: no output.
      Then the tool-name diff of Task 1 Step 4 again — Expected: no differences.

### Task 3: Docs

**Files:** `CLAUDE.md` (Transition table), `docs/modules.md`, `docs/plugins.md`, every `README.md`
under `src/` and `src-tauri/` that names a moved file, folder or renamed symbol.

- [ ] **Step 1: Replace names in the docs** with the same maps (paths as they're written in prose,
      e.g. `` `frame.agent-tools.ts` `` → `` `frame.mcp.ts` ``, `canvas/agent/` → `canvas/mcp/`,
      `products/design/agent/` → `products/design/mcp/`, the board core's tool files → their
      `modules/core/mcp/` names, and the Symbols table). The moved READMEs (`canvas/mcp`, `products/*/mcp`)
      describe their folder's new contents; `products/board/mcp/README.md` says the general tools now live
      in `modules/core/mcp/`.
- [ ] **Step 2: Transition table.** Remove the phase 2 row; add a row "board core's tools import the
      `geo` and `er` features (`create-shapes.mcp.ts`, `apply-result.ts`) | fixed in phase 5".
- [ ] **Step 3: Check.**
      Run: `grep -rnE 'agent-tools?\.ts|\bAgentTool|agentTools|canvas/agent|products/(board|design)/agent' CLAUDE.md docs/modules.md docs/plugins.md $(find src src-tauri/src -name README.md)` — Expected: no output.
      Then `pnpm format:check && pnpm lint && pnpm typecheck` — Expected: pass.
- [ ] **Step 4: Give the user the commit message**, e.g.:
      `refactor: MCP tools in .mcp.ts files, McpTool types and mcpTools points` with a short body (the
      file moves, the board core's tools in its module, the renames, the plugin API keys).
