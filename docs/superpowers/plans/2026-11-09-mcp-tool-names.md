# MCP Tool Names by Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every MCP tool is named `<prefix>_<object>_<verb>` with the prefix added by the host (module id, plugin id, or a core topic), Board and Design share one tool where they do the same thing, and agents that can refresh their tool list only see their tab's product.

**Architecture:** Tools keep declaring a local `name` (the part after the prefix); `collectMcpTools` builds the full name from the group's owner and validates it. The app's server definition merges both products' tools by full name and dispatches a shared tool by the product of the agent's tab. The Rust transport gains a per-session SSE stream (GET), over which the webview sends `notifications/tools/list_changed`; `tools/list` answers per session.

**Tech Stack:** TypeScript (strict), Tauri 2 (Rust, axum), Zustand, MCP Streamable HTTP.

**Spec:** `docs/superpowers/specs/2026-11-09-mcp-tool-names-design.md` (read it first: the name table there is the source for every rename).

## Global Constraints

- Full tool name: `^[a-z0-9][a-z0-9_-]*$`, at most **44** characters (`MCP_TOOL_NAME_MAX = 44`).
- Grammar: `<prefix>_<rest>`, `<rest> = [<object>_]<verb>[_to_<target>]`, action last.
- Prefix: built-in feature module → its module id verbatim; core module → the group's declared topic `prefix`; plugin module → plugin id verbatim (a declared `prefix` is refused); shared groups in `canvas/mcp` → their topic.
- Reserved prefixes: every built-in module id and every topic prefix in use; a plugin whose id is one has its tools refused.
- Same full name twice in one product → built-ins throw at server creation naming both modules; plugin tools are refused and reported. Same name in both products → shared tool, only if `inputSchema` is deep-equal.
- No aliases for old names.
- `CLAUDE.md` rules hold: layering (products never import each other, Rust is transport only), types in `.types.ts`, files ≤ ~200 lines, user text through `t` (MCP tool text stays English), changelog in both languages.
- Verification is only `pnpm lint`, `pnpm typecheck`, `pnpm format:check` (no test framework; don't run builds, cargo or the app). Rust changes in Task 7 are checked by reading; say so in the report.
- Commit on master, conventional messages, **no `Co-Authored-By` line**.

## Review Focus

1. **A non-refreshing agent app after a product switch** (stream open, client not flagged): must get the full list, never a filtered one. Task 8 step pins it.
2. **Unbound session calling a shared tool with no file tab on screen**: must fail with today's "no file is open" message naming `file_open`/`file_new`, not crash in dispatch. Task 2 step pins it.
3. **A plugin whose id is a reserved prefix (`er`, `shapes`) or whose names exceed 44 characters**: its tools refused and reported in `plugins_list`, the app keeps starting. Task 1 step pins it.
4. **Stream closed while a notification is sent** (agent quit): `notify` must be a no-op, not an error toast loop. Task 7 step pins it.
5. **Old names lingering in descriptions, errors and instructions** (`"use list_shapes"`): an agent following them calls a tool that no longer exists. Task 10's grep pins it.

---

### Task 1: Prefixed names in the engine

**Files:**

- Create: `src/canvas/mcp/mcp-tool-name.ts` (+ `.types.ts` if it exports types)
- Create: `src/canvas/mcp/mcp-prefix.ts`, `src/canvas/mcp/mcp-prefix.types.ts`
- Modify: `src/canvas/mcp/mcp-tool.types.ts`, `mcp-tool-group.types.ts`, `collect-mcp-tools.ts`, `index.ts`, `README.md`
- Modify: `src/shared/core/modules/modules.types.ts`, `module-host.ts` (`tierOf`)
- Modify: `src/products/board/mcp/create-mcp-tools.ts`, `src/products/design/mcp/create-mcp-tools.ts`
- Modify: board and design `core` module MCP groups (temporary `prefix: "board"` / `"design"`; Tasks 3–4 regroup by topic)
- Modify: `src/app/mcp/agent-server-definition.ts`, `agent-tool-catalog.ts`, `agent-plugins.ts`

**Interfaces:**

- Produces:
  - `McpToolGroup<H, C>` gains `prefix?: string` (topic, core and canvas groups only).
  - `McpTool<H>` gains `scope?: "file" | "app"` (default `"file"`; `"app"` = needs no file).
  - `MCP_TOOL_NAME_MAX = 44`; `checkMcpToolName(name: string): string | null` (null = valid, else the reason, English).
  - `mcpToolName(prefix: string, local: string): string` → `${prefix}_${local}`.
  - `McpToolOwner = { moduleId: string; tier: "core" | "feature" | undefined; pluginId: string | undefined }`.
  - `mcpPrefixFor(group: { id: string; prefix?: string }, owner: McpToolOwner, reserved: ReadonlySet<string>): { prefix: string } | { refused: string }`: plugin → plugin id (refused if `group.prefix` set or id in `reserved`); core → `group.prefix` (throws `Error` naming the module when missing); feature → module id (throws when `group.prefix` set).
  - `CollectedMcpTool<H> = { name: string; tool: McpTool<H>; moduleId: string; pluginId?: string }`; `RefusedMcpTool = { name: string; pluginId: string; reason: string }`.
  - `collectMcpTools<H, C>(groups, context, ownerOf: (group) => McpToolOwner, reserved: ReadonlySet<string>): { tools: CollectedMcpTool<H>[]; refused: RefusedMcpTool[] }` — throws for a built-in clash/invalid name (message names both modules), refuses for plugins; the `taken`/`onSkipped` parameters go.
  - `ModuleHost.tierOf(moduleId: string): "core" | "feature" | undefined`.
  - `createBoardMcpTools(modules, kinds, pluginOf: (moduleId: string) => string | undefined, reserved)` and the design twin return the `collectMcpTools` result.
  - `builtInPrefixes(modules: ModuleHost, point): Set<string>` (exported from `canvas/mcp`): module ids of non-plugin owners plus declared topics, for `reserved`.

- [ ] **Step 1:** Add the types and `checkMcpToolName` (charset regex and length from Global Constraints) and `mcpToolName`.
- [ ] **Step 2:** Add `mcpPrefixFor` and rewrite `collectMcpTools` to the signature above; `ModuleHost.tierOf` reads the module's `tier`.
- [ ] **Step 3:** Products' `create-mcp-tools.ts` resolve the owner with `modules.ownerOf(point, group.id)` + `tierOf` + `pluginOf`. The app passes `pluginOf` from the plugins store (`status.modules` per plugin id) and builds `reserved` from both products.
- [ ] **Step 4:** Give each board/design `core` group `prefix: "board"` / `"design"` (transitional). Adapt `agent-server-definition.ts` (no `taken`; refused tools → `notifyError(t("mcp.toolLeftOut"), …)` once each), `agent-tool-catalog.ts` and `agent-plugins.ts` (tool names from `CollectedMcpTool.name`; `AgentPlugin` gains `refusedTools?: { name: string; reason: string }[]`).
- [ ] **Step 5:** Pin Review Focus 3: in `collectMcpTools`, a plugin group whose owner's plugin id is in `reserved` yields only `refused` entries with reason `"The plugin id \"<id>\" is a built-in prefix."`, and a name over 44 characters yields `"\"<name>\" is longer than 44 characters."`; neither throws.
- [ ] **Step 6:** `pnpm lint && pnpm typecheck && pnpm format:check` → all pass. (Tool names are now transitional, e.g. `er_list_er_diagrams`; that's expected until Task 6.)
- [ ] **Step 7:** Commit `feat(mcp): tool names get their owner's prefix`.

### Task 2: Product dispatch and shared tools in the server

**Files:**

- Create: `src/app/mcp/agent-tool-dispatch.ts` (+ `.types.ts`)
- Modify: `src/app/mcp/agent-server-definition.ts`, `agent-server-definition.types.ts`, `agent-runtime.ts`
- Create: `src/canvas/mcp/same-schema.ts` (deep-equal of two JSON schemas)

**Interfaces:**

- Consumes: Task 1's `createBoardMcpTools`/`createDesignMcpTools` results, `tabsTools`.
- Produces:
  - `ProductTool = { name: string; board?: CollectedMcpTool<AgentHost>; design?: CollectedMcpTool<DesignAgentHost>; app?: McpTool<…> }` and `mergeProductTools(board, design, app): ProductTool[]` — same name in both products with `sameSchema` → one entry; different schemas → throws naming both modules; an app tool (canvas group, or `scope: "app"`) clashing with a product tool → throws.
  - `toolProducts(tool: ProductTool): FileType[]` (empty for app tools).
  - `AgentServerOptions.productFor(context: McpMessageContext): FileType | null` — the bound tab's type, else the active tab's type, else `null`; read at call time.
  - The server's `run` for a product tool: `prepare`, then `productFor`; no product → throw `No file is open: open one with file_open or create one with file_new.` (until Task 3 lands those tools, keep today's text but with the new names); product without an implementation → throw `This tool works on ${products}; your tab holds a ${product}. Use tabs_switch or file_open.`
- [ ] **Step 1:** `sameSchema(a, b): boolean` (key-order-insensitive deep equality).
- [ ] **Step 2:** `mergeProductTools` and the dispatching `run` as above; app tools run on the full host as today.
- [ ] **Step 3:** `productFor` in `agent-runtime.ts` from `agentTabs.tabFor(key)` → `fileTabs` tab `type`, else the active tab's.
- [ ] **Step 4:** Pin Review Focus 2: a product tool called with no file tab bound or active throws the "No file is open" text above (after `prepare`, whose wait already ends with no editor), never `undefined` access.
- [ ] **Step 5:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.
- [ ] **Step 6:** Commit `feat(mcp): one server tool per name, run on the agent's tab's product`.

### Task 3: Tools that need no file

**Files:**

- Create: `src/canvas/mcp/files.mcp.ts`, `files.mcp.types.ts` (`FilesAgentHost`), `plugins.mcp.ts`
- Modify: `src/canvas/mcp/tabs.mcp.ts` (`prefix: "tabs"`, names `list`, `switch`), `agent-tabs.types.ts`
- Move: `AgentPlugin` type from `src/products/board/mcp/board-mcp.types.ts` to `src/canvas/mcp/` (re-export from `@board` for existing users)
- Delete: board `core/mcp/plugins.mcp.ts`; the recent/open/new tools of `core/mcp/file.mcp.ts` (board) and `design-file.mcp.ts` (design) — `save_*` stays for Task 4
- Modify: `src/app/mcp/agent-host.ts` or new `src/app/mcp/tabs/files-host.ts` implementing `FilesAgentHost`
- Modify: board `sticker/sticker.mcp.ts`: `list_stickers` gets `scope: "app"` (renamed in Task 4)

**Interfaces:**

- Produces:
  - `FilesAgentHost { recentFiles(type?: FileType): Promise<AgentRecentFile[]>; openFile(type: FileType | undefined, ref: AgentFileRef): Promise<AgentFileOpened | AgentFileCandidates>; newFile(type: FileType, options: AgentNewFile): Promise<AgentFileOpened | AgentProjectChoice>; plugins(): AgentPlugin[] }`, where `AgentFileOpened = { type: FileType; name: string }`.
  - App-level groups `filesTools` (`prefix: "file"`: `recent_list`, `open`, `new`) and `pluginsTools` (`prefix: "plugins"`: `list`), served beside `tabsTools`.
  - `file_open` with `type` omitted looks a name up in both products (several matches → `candidates`, each with its `type`); `file_new` requires `type`.
- [ ] **Step 1:** Write `files.mcp.ts`/`plugins.mcp.ts` reusing the existing open/new/recent descriptions and argument parsers (one description covering boards and designs).
- [ ] **Step 2:** Implement `FilesAgentHost` in the app over the existing `openBoard`/`openDesign`/`newBoard`/`newDesign`/`recentFiles`/`plugins` code; delete the product copies.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.
- [ ] **Step 4:** Commit `feat(mcp): file, tab and plugin tools shared by both products`.

### Task 4: Shared tools with one schema

**Files:**

- Modify: `src/canvas/mcp/arrange.mcp.ts`, `scale.mcp.ts`, `style.mcp.ts`, `arrange.mcp.types.ts` (drop `noun` from names; descriptions say "elements")
- Modify: board `core/mcp/*` and design `core/mcp/*`: regroup into topic groups `file` (`get`, `info_set`, `save`), `selection` (`get`, `set`), `history` (`undo`, `redo`), `view` (`fit`, `fit_elements`, `snapshot`), `clipboard` (`png_copy`), `arrange` (`align`, `distribute`, `tidy_up`, `scale`), `style` (`copy`)
- Modify: board and design `sticker`, `model3d` module MCP files (`sticker_stamp`, `sticker_list`; `model3d_add`, `model3d_view_set`, `model3d_convert_to_png`)

**Interfaces:**

- Consumes: Task 2's merge (identical `inputSchema` required).
- Produces: the shared names of the spec's "Core topics" and "Modules in both products" tables.
- [ ] **Step 1:** For each shared pair, make the board and design `inputSchema` identical: the union of both sides' arguments, ids as `ids` (strings), product-only arguments described "Boards only." / "Designs only." and ignored by the other side. Put the one shared description in a constant both sides import from `canvas/mcp` where the text isn't product-specific.
- [ ] **Step 2:** Rename per the spec tables; core groups get their topic `prefix`; remove the transitional `"board"`/`"design"` prefix from groups that are now empty or regrouped.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass (a schema mismatch throws only at runtime: re-read each pair's two schemas side by side before committing).
- [ ] **Step 4:** Commit `feat(mcp): board and design share their common tools`.

### Task 5: Board names

**Files:** board `core/mcp/*` (topic `shapes`: `list`, `get`, `create`, `update`, `delete`, `duplicate`, `reorder`, `lock`, `export`), `colors/mcp/*`, `db/db.mcp.ts`, `db-export/db-export.mcp.ts`, `er/er.mcp.ts`, each module's `README.md` "MCP tools:" line.

**Interfaces:** Consumes Task 1's prefixing; local names are the spec's new names minus `<prefix>_`.

- [ ] **Step 1:** Rename per the spec's "Board core" and "Board modules" tables; update descriptions and thrown messages that name any tool (old or new) to the new full names.
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.
- [ ] **Step 3:** Commit `feat(mcp): board tools named by module`.

### Task 6: Design names

**Files:** design `core/mcp/*` (topic `nodes`: `list`, `get`, `create`, `update`, `delete`, `duplicate`, `reorder`, `lock`, `rotate`, `flip`, `export`), and the MCP files of `auto-layout`, `boolean`, `catalog`, `color-wizard`, `data`, `frame`, `group`, `image`, `layer-export`, `layers`, `mask`, `pages`, `prototype`, `sticker` (`restyle`, `convert_to_vector`), `styleguide`, `text`, `variables`, `vector`; their READMEs.

- [ ] **Step 1:** Rename per the spec's "Design core" and "Design modules" tables; descriptions and messages use new full names.
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.
- [ ] **Step 3:** Commit `feat(mcp): design tools named by module`.

### Task 7: The stream (transport)

**Files:**

- Modify: `src-tauri/src/mcp/routes.rs`, `mod.rs` (state: per-session SSE senders), `commands.rs` (`mcp_notify`), `src-tauri/src/lib.rs` (register command), `src-tauri/src/mcp/README.md`, capabilities if commands are listed there
- Modify: `src/shared/core/agent-channel.ts`, `src/platform/tauri-agent-channel.ts`

**Interfaces:**

- Produces:
  - GET `/mcp` with `Mcp-Session-Id` (same local/enabled checks as POST; 400 without a session) → `text/event-stream`, keep-alive comment every 15 s. Opening emits `mcp://message` with `stream: "opened"`; the stream ending emits `stream: "closed"`.
  - `AgentMessage.stream?: "opened" | "closed"` (no reply expected for these).
  - `AgentChannel.notify(session: string, body: string): Promise<void>` → Rust `mcp_notify` writes one `event: message` / `data: <body>` to that session's stream; no stream → `Ok(())`, no error.
- [ ] **Step 1:** Rust: GET handler and per-session `tokio::sync::mpsc` senders in `McpState`, removed when the stream drops; `mcp_notify` command.
- [ ] **Step 2:** TS channel: `stream` field and `notify`.
- [ ] **Step 3:** Pin Review Focus 4: `notify` for a session whose stream closed resolves without error and nothing is toasted.
- [ ] **Step 4:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass; report that the Rust part is unchecked by cargo, per the rules.
- [ ] **Step 5:** Commit `feat(mcp): agents can keep a stream open for notifications`.

### Task 8: Tool lists per session

**Files:**

- Create: `src/app/mcp/agent-tool-lists.ts` (+ `.types.ts`)
- Modify: `src/shared/core/mcp/mcp.types.ts` (`toolsFor?`), `handle-mcp-message.ts` (`listChanged: true`, `tools/list` per session), `README.md`
- Modify: `src/shared/agent-server/agent-clients.types.ts`, `agent-clients.ts` (`refreshesTools?: boolean`, `true` for `claude-code`)
- Modify: `src/app/mcp/use-agent-server.ts`, `agent-runtime.ts`, `agent-presence-source.ts` (or wherever `connected` identifies the client)

**Interfaces:**

- Consumes: Task 2's `ProductTool`/`toolProducts`/`productFor`; Task 7's `stream` and `notify`.
- Produces:
  - `McpServerDefinition.toolsFor?(context: McpMessageContext): readonly McpServerTool[]` (used by `tools/list` when present).
  - `createAgentToolLists({ notify, productFor })` with `connected(session, client: AgentClient)`, `streamOpened(session)`, `streamClosed(session)`, `ended(session)`, `filtered(session): FileType | null | "all"`, `refresh(): void` (re-reads each filtered session's product and sends `{"jsonrpc":"2.0","method":"notifications/tools/list_changed"}` when it changed).
  - A session is filtered only when its stream is open **and** its client has `refreshesTools`; it lists its product's tools, shared ones and app tools; `null` product (no file tab) lists app tools and shared ones.
  - `refresh()` runs on `fileTabs` changes (active tab, tabs closed) and agent binding changes.
- [ ] **Step 1:** `toolsFor` + `listChanged: true` in `shared/core/mcp`.
- [ ] **Step 2:** `agent-tool-lists.ts`, wired in `agent-runtime.ts`/`use-agent-server.ts` (`stream` messages call `streamOpened`/`streamClosed`, `ended` cleans up).
- [ ] **Step 3:** Pin Review Focus 1: a session with an open stream whose client lacks `refreshesTools` (or is unidentified) gets the full list from `toolsFor`, and `refresh()` never notifies it.
- [ ] **Step 4:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.
- [ ] **Step 5:** Commit `feat(mcp): agents that refresh their tools see only their tab's product`.

### Task 9: What people see

**Files:**

- Modify: `src/app/mcp/agent-tool-catalog.ts` (sections: shared + no-file first, then Board, Design, plugins), `src/shared/agent-server/` section titles through its `t` (`locales/en.json`, `es.json`)
- Modify: `src/app/mcp/agent-call-label.ts`

**Interfaces:**

- Produces: `agentCallLabel(tool, state, touched)` keeps its signature; it drops the first word when it's a prefix (any `CollectedMcpTool` prefix: pass the known prefixes or strip the first segment), reads the verb from the end (or before `_to_`), and still yields e.g. `shapes_create` → "Creating shapes" / "Created shapes", `model3d_convert_to_png` → "Converting model3d to png", `history_undo` → "Undoing".
- [ ] **Step 1:** Catalog sections as above; section titles translated (en/es).
- [ ] **Step 2:** Label rewrite; `er`/`dbml` capitalization kept.
- [ ] **Step 3:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.
- [ ] **Step 4:** Commit `feat(mcp): the agents menu and activity read the new names`.

### Task 10: Instructions, docs, checks and changelog

**Files:**

- Modify: `src/products/board/mcp/mcp-instructions.ts`, `src/products/design/mcp/mcp-instructions.ts`, and a shared part (new `src/canvas/mcp/mcp-instructions.ts`) assembled in `agent-server-definition.ts` as shared → board → design
- Modify: `docs/modules.md` ("MCP files": the naming rule replaces "a separate plan"), `docs/plugins.md` (prefix, grammar, reserved prefixes, 44 characters including the plugin id), `src/app/mcp/README.md`, `src/canvas/mcp/README.md`, `src/products/*/mcp/README.md`, `src-tauri/src/mcp/README.md` if not done
- Modify: `examples/plugins/callout/main.js` (local name only; full name `callout_<rest>`)
- Modify: `scripts/check-modules.mjs`: a module group's literal `name: "…"` in `.mcp.ts` matches `^[a-z0-9]+(_[a-z0-9]+)*$`; only `core` modules and `src/canvas/mcp` may set `prefix:`
- Modify: `CHANGELOG.md`, `CHANGELOG.es.md` (Improved / Mejoras): agent tools have new, organized names; agents that support it see only the tools of the file they work on; saved permission lists for the old names need the new ones. No internal names.
- Modify: memory note `module-conventions-followups` (remove the done item) — outside the repo, done by the coordinator

- [ ] **Step 1:** Instructions in three parts; every tool name is a new one.
- [ ] **Step 2:** Docs, READMEs, example plugin, check-modules rule.
- [ ] **Step 3:** Pin Review Focus 5: from the spec's tables, build the list of old names and grep `src/`, `docs/`, `examples/` for each as a whole word (`grep -rnw`); the only hits allowed are in the spec, this plan and `CHANGELOG*` history. Fix any other hit.
- [ ] **Step 4:** Changelog entries (en/es).
- [ ] **Step 5:** `pnpm lint && pnpm typecheck && pnpm format:check` → pass.
- [ ] **Step 6:** Commit `docs(mcp): tool names by module in instructions, docs and changelog`.
