# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cloudy Canvas (by DarkRedgm) is a desktop-first Figma + FigJam app built with Tauri 2, React 19, Vite, TypeScript (strict, `noUncheckedIndexedAccess`), Tailwind v4, shadcn/ui (Radix), Zustand and React Router. It has two file types: **Board** (`.cboard`, FigJam-style; the editor is implemented at `/board/:id`) and **Design** (`.cdesign`, Figma-style; still a placeholder at `/design/:id`). Roadmap: desktop with local files, then a web build of the same frontend, then real-time collaboration (Yjs + Hocuspocus, Laravel backend). It must build on both Windows 11 and Arch Linux.

## Commands

```sh
pnpm install
pnpm tauri dev      # desktop app
pnpm dev            # frontend only in a browser (native dialogs unavailable)
pnpm lint           # ESLint (flat config, eslint.config.js)
pnpm typecheck      # tsc for app + vite config (noEmit)
pnpm format         # Prettier (with tailwind plugin); format:check to verify
pnpm tauri build    # production bundle
```

There is no test framework. **Verification is `pnpm lint` and `pnpm typecheck` only** (plus `pnpm format:check`). Do not run `tauri dev`, cargo, builds or browser checks to verify changes unless asked.

`VITE_MOCK_RECENTS=true` in `.env.local` (see `.env.example`) fills the Home "Recent files" grid with mock data in dev builds. `/design-system` is a dev-only page that previews tokens and components.

## Layering (enforced)

Path aliases: `@app`, `@pages`, `@engine`, `@core`, `@ui`, `@platform`, `@stores`. They are defined in both `tsconfig.json` and `vite.config.ts`, so keep the two in sync.

- `src/engine/` and `src/core/` are plain TypeScript and framework/platform-agnostic, so the future web version can reuse them. ESLint `no-restricted-imports` bans `react`, `@ui`, `@pages`, `@app`, `@stores`, `@platform` and `@tauri-apps/*` there.
- Platform access goes through interfaces in `core/` (e.g. `Storage` in `storage.types.ts`), implemented in `platform/` (Tauri).
- Business logic lives in TypeScript, not Rust. `src-tauri/` registers plugins (dialog, fs), holds window config/capabilities and runs the agent server's HTTP transport (`src/mcp/`, which carries no MCP logic).
- Ids come from `createId()` (`crypto.randomUUID()`), never auto-increment.
- Zustand stores (`src/stores/`) hold app UI state only, never canvas content.

## Board engine architecture (`src/engine/`)

- `CanvasEngine` (`canvas-engine.ts`) is a coordinator that wires the pieces together:
  - `BoardDocument`: the content, a Yjs doc.
  - `Camera`
  - `Scene`: shape list, selection, hover and marquee, plus spatial queries.
  - `Renderer`: PixiJS.
  - The tools.
  - Input modules: pointer, wheel and keyboard.
  - `TextEditor`: a DOM textarea overlay.
- **Content lives only in the Yjs doc.** Each shape is a `Y.Map` inside the `"shapes"` map. Order is a fractional-index string (`index`), and lexicographic order is z-order.
  - All edits go through `BoardDocument` methods (`add`, `update`, `updateMany`, `remove`), which transact with `LOCAL_ORIGIN` so `Y.UndoManager` tracks only local changes.
  - Call `doc.checkpoint()` before a user action to start a new undo step.
- **Data flow is one-way.** Tools write to the document, and `doc.observe` reports `{ updated, removed }` ids. The engine then refreshes the `Scene`, syncs only the changed Pixi views (`render/layers/shape-layer.ts`) and requests a frame.
  - Rendering is on demand: Pixi uses `autoStart: false`, and `FrameScheduler` renders at most once per animation frame.
- **Tools** (`tools/`) implement `Tool` and act only through `ToolContext`, never through the engine directly.
- **Extension points are registries:**
  - New tool: add it to `tools/tool-ids.ts`, then `tools/create-tools.ts`.
  - New shape type: add the type in `document/shapes.types.ts`, a factory in `document/shape-factory.ts` and a drawer in `render/shapes/shape-drawers.ts`.
  - New shortcut or action: add it to `commands.ts` and `input/keymap.ts`.
- **`input/keymap.ts` is the single source for shortcuts.** The UI reads labels via `shortcutLabel(commandId)`, so never hard-code shortcut strings in components. Key matching and formatting helpers live in `core/keyboard.ts` (shared with the `useHotkey` hook in `ui/hooks/`).
- **Shapes and connectors** (`shape` and `connector` tools). `geo` shapes (`geo/` outlines) have fill, stroke and centered text that's edited with the `TextEditor`. A `connector`'s ends are free points or attached to a shape (`shapeId` plus an optional side).
  - `Scene.refresh()` replaces each connector with a copy resolved by `connectors/resolve-connector.ts` (route, bounds, `points`). So **read shapes for geometry from the scene** (`scene.get`, `ctx.getShape`), not `doc.get`; the stored connector bounds are stale.
  - When shapes change, the engine also redraws the connectors attached to them (`scene.connectorsAttachedTo`). Deleting goes through `remove-shapes.ts`, which frees the attached connector ends and prunes DB refs.
  - Presses on handles (connector ends, resize, quick-connect dots, table columns) are resolved by `find-interaction.ts` before normal selection. The handle geometry lives in `handles/`.
- **Sections** (`section` tool, `sections/`). Membership is geometric: a section's members are the shapes fully inside it, worked out when a drag starts (`withSectionMembers`). Nothing stores parent links, so dropping in, dragging out and resizing need no bookkeeping.
  - Drawing order comes from `zOrderKey` (`document/z-order.ts`): sections first, larger ones further back, then everything else by `index`. Sections render in their own Pixi layer, under the DB relation lines.
  - A section is hit by its title or border only; clicks inside it reach its contents or start a marquee. Deleting a section deletes its members.
- **Database tables** (`db/`, the `db` tool): each table is a `db-table` shape whose `columns` are a plain JSON array. A relation lives on the source column (`column.ref`) and points at the target by table/column **id**, so moves and renames never break it. Tables keep `indexes` (whose parts are column ids or expressions) and a `note`, which is drawn as a bubble beside the table (`noteHidden` is view state, written with `doc.updateUntracked`). A column's `type` is the bare name (`varchar`) and its arguments live in `typeArgs` (`255`); `document/column-type.ts` splits and joins them (`splitColumnType`, `formatColumnType`), and aliases are normalized on input (`int` → `integer`, `document/type-aliases.ts`). Enums are `db-enum` cards; columns use an enum by naming it as their type. Stickies with a `noteName` are DBML sticky notes. Tables, enums and linked stickies together form the board's single schema (`schema-shapes.ts`).
  - `DbSchema` (`engine.db`) is a facade and the only place that edits the schema. The logic lives in `table-edits.ts`, `enum-edits.ts` (an enum rename also retypes its columns) and `schema-dbml.ts`, which has `applyTableDbml` / `applyEnumDbml` (one slice), `applySchemaDbml` (the whole schema) and `importSchemaDbml` (merge).
  - DBML is a generated view (`db/dbml/`: a hand-written parser and serializer for a subset). Parsed text goes through `reconcile.ts` and `reconcile-*.ts`, which match tables, columns, enums, values and notes by name, then by position for renames, so ids survive. Tables that refs name but nothing defines are created by `add-missing-tables.ts` on import, paste and blur (not while typing, so half-typed names don't become tables). Older boards get new fields filled by `document/fill-shape-defaults.ts`.
  - Relations are resolved in `Scene` and drawn by `render/layers/relation-layer.ts` under the shapes. New relations are dragged from column handles by `tools/connect-gesture.ts`, with `input/edge-auto-pan.ts` panning when the pointer nears the edge.
- **ER diagrams** (`er/`, the `er` tool). These are Chen-notation entity–relationship diagrams with the extended model. The language and the visual editor are documented in `docs/er-language.md`. There are six shape types:
  - `er-entity`: rectangle, doubled when `weak`.
  - `er-relation`: diamond, with `identifying` (double) and `idMark` (the "I" bar). Its `participants` point **by id** at entities or aggregations, with `(min,max)`, a role and an `arrow` flag.
  - `er-attribute`: `ownerId` is an entity, relation, composite attribute, hierarchy (its discriminator) or aggregation. It has key/multi/derived/optional flags, a `look` (`ellipse`/`lollipop`) and an `order`.
  - `er-isa`: hierarchy triangle, with `parentId`, children, `exclusive`/`total` and parent/child cardinalities.
  - `er-aggregate` and `er-constraint`: their **geometry is derived**. `Scene.refresh()` runs `resolve-er.ts`, so the box follows the relation and its participants, and the constraint's `points` follow its relations. Read their geometry from the scene, not the doc. Aggregations sit behind, like sections, and are hit by their border or name only.
  - Lines aren't shapes. `er-links.ts` derives them, including loops for self-relations (`loop-route.ts`), arrows and the total mark. `render/layers/er-link-layer.ts` draws them under the shapes.
  - **A board holds several diagrams.** Every ER shape has `diagram` (an id) and `diagramName` (repeated on each shape of the diagram). Names, text, layout and edits are per diagram. `applyErPlan(doc, plan, scope)` stamps the diagram on every shape it writes, so creators just spread `NO_ER_DIAGRAM`. Boards saved before diagrams existed are split into diagrams by connected component on load (`migrate-er-diagrams.ts`, not an undo step).
  - `ErModel` (`engine.er`) is the board-level facade: `diagram(id)`, `diagrams()`, `diagramOf(shapeId)`, `shape(id)`, `remove(id)` and `newDiagram(center?)` (the `er` tool always starts a new diagram). `EngineState.selectedErDiagram` is the selection's diagram.
  - `ErDiagram` (`er-diagram.ts`) is one diagram:
    - `text()` and `applyText(text, { createMissing })`. The text in `er/lang/` is parsed with the DBML tokenizer; its `Diagram <name> [style: …]` line carries the name. `reconcile-er.ts`/`reconcile-extended.ts` match by name then position, so ids and positions survive. `add-missing-entities.ts` creates named-but-undefined entities on paste/blur only.
    - `textRange(shapeId)`: where the shape's block is written (`serializeErBlocks`), which the Text tab highlights.
    - `relayout()` and `rename(name)`.
    - `edits`: `er-edits.ts` over the pure functions in `er/edits/`. Each edit builds the next model and goes through `applyErPlan` (one undo step, new shapes auto-placed).
  - `er/layout/` is deterministic auto-layout:
    - `entity-grid.ts` gives entities grid cells; hierarchy children go in the row under their parent.
    - `place-isas.ts` places triangles, and `place-relations.ts` places diamonds.
    - `place-aggregates.ts` and `aggregate-boxes.ts` keep outside shapes out of aggregation boxes.
    - `place-attributes.ts`/`fan-out.ts` fan attributes into free directions, avoiding boxes and lines.
    - `resolve-overlaps.ts` cleans up leftover overlaps.
  - `applyErPlan` lays out an all-new diagram fresh and places only new shapes around an existing one.
  - Dragging takes attributes (and an aggregation's contents) along (`withErMembers`). `pruneEr` cleans up orphans after removals.
  - ER names are renamed in place with the `TextEditor`: `ErNamedShape` is part of `EditableShape`, and `editableText()` reads the name.
- **UI state** is exposed as an immutable `EngineState` snapshot (`utils/store.ts`, shallow-compared), via `engine.subscribe` / `engine.getState`.

## Agent (MCP) server

Agents (Claude Code, Cursor, …) connect to the running app at `http://127.0.0.1:47821/mcp`. If that port is taken the server tries the next nine, and the URL is written to `mcp.json` in the app data folder. Access is on by default, with no auth: only loopback, with Host and Origin checked against DNS rebinding.

- **Rust is only the transport** (`src-tauri/src/mcp/`): stateless Streamable HTTP (POST only). Each body is emitted to the webview as `mcp://message` and answered through the `mcp_reply` command (30 s timeout). `mcp_status` and `mcp_set_enabled` back the UI.
- **The protocol is TypeScript.** `core/mcp/handle-mcp-message.ts` is a small hand-written JSON-RPC handler (`initialize`, `ping`, `tools/list`, `tools/call`). It reaches the platform through the `AgentChannel` interface (`core/agent-channel.types.ts`, `platform/tauri-agent-channel.ts`), and `agentChannel` is `null` outside Tauri.
- **Tools are a registry in `engine/agent/`**: one group per file (`board-read-tools`, `shape-edit-tools`, `db-tools`, `er-tools`, `view-tools`, `file-tools`), listed in `create-agent-tools.ts`. A tool gets an `AgentHost` (the open board, recent files, opening a board). Every editing tool wraps its writes in `asUndoStep` so one call is one Ctrl+Z, and builds or validates everything before writing.
- **The app wires it up** in `app/mcp/` (`useAgentServer`, mounted by `<AgentServer />` in the providers). The open board registers itself for agents with `useAgentBoard` (`pages/editor/board/agent/`). The on/off setting is `stores/agent-server-store.ts`, and `pages/agent-server/` is the menu in both top bars that copies the URL and setup.

## React host (`src/pages/editor/board/`)

- `useCanvasEngine` creates and mounts the engine into a container div. The canvas theme is resolved from CSS tokens via `readCanvasTheme()`.
- The engine is provided through `EngineContext`. Chrome components use `useEngine()` and `useEngineState(selector)` (from `engine/engine-context.ts`), selecting primitives or stable references so each one re-renders only for its slice.
- **Never put canvas shapes in React state.** React only hosts the canvas and draws the UI around it. Text views of the document (DBML, ER) share `components/source-editor/`, which applies text while typing and shows errors. The ER panel (`components/er-panel/`) opens when an ER shape is selected and shows that shape's diagram (`boardPanelStore.erDiagram`; `useErDiagram()`, and `useErQuery` reads from it). Its header has the diagram switcher (name, list, New diagram). It has a Visual tab (one form per shape kind in `er-panel/forms/`, reading through `useErQuery` / `useErShape`) and a Text tab, plus an Add menu, re-layout and the attribute style toggle. The DB side panel (`components/db-panel/`) reads tables through `useDbQuery` / `useDbTable` (read-through caches keyed on `engine.db.getVersion()`).
- **Files:** `file/` loads the board's `BoardDocument` from `Storage` (or starts an empty one for a new id) and saves it. A `.cboard` file is the `CCBD` magic, a u32 format version and a Yjs update (`core/board-file.ts`). `TauriStorage` keeps a recent-files index (id → path) in the app data folder. Ctrl+S / Ctrl+Shift+S are engine commands that call the host's `setHostActions`.

## Code conventions

- **Small, single-purpose files:** one component, tool, layer or helper per file, re-exported through a folder `index.ts`. Split a file once it mixes concerns or grows past ~200 lines. Reuse the shared helpers before writing new ones:
  - `engine/utils`: `Store`, `Emitter`, `Disposables`, `FrameScheduler`, `debounce`, `clamp`/`mod`.
  - `core/keyboard.ts`
  - `ui/layout`: `AppHeader`, `PageContainer`.
  - `ui/hooks`
- **Types go in sibling `<file>.types.ts` files:**
  - Every `interface` and `type`, including component props, goes in a `.types.ts` file next to its code, and is imported with `import type`.
  - Barrels re-export them with `export type`.
  - Vendored shadcn primitives in `src/ui/components/ui/` are exempt and stay as generated.

## Design system

- **Tokens** live in `src/ui/styles/tokens.css` and are mapped to Tailwind in `src/app/styles.css`. Tailwind's default colors and radii are reset, so only design-system values exist.
  - Components use **semantic tokens only** (`bg-surface`, `text-muted-foreground`, `bg-primary`, …). They never hard-code colors or use the palette scales (`ice`, `seal`, `blush`, `sand`, `lilac`).
  - Canvas colors are tokens too (`--canvas-*`).
  - Document content colors (sticky/marker palettes in `engine/document/palette.ts`) are data saved with the file, not theme tokens.
- **Sharp shapes:** the user dislikes rounded styles.
  - Radii are 4px for controls (`rounded-md`) and 6px for cards and menus (`rounded-card`/`rounded-lg`), with 8px as the maximum.
  - No pills.
- **Roles:** primary = ice blue, secondary = seal gray, accent = blush peach (use sparingly), board = sand, design = lilac. The mascot/logo is a "foca watona" (spotted seal) peeking over a canvas (`src/ui/brand/`).
- **Light theme only for now.** `FORCE_LIGHT_THEME` in `src/stores/theme-store.ts` (mirrored in the `index.html` bootstrap script) disables dark mode. The `.dark` tokens and the theme plumbing are kept for later.
