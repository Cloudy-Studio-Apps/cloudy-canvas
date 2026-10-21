# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cloudy Canvas (by DarkRedgm) is a desktop-first Figma + FigJam app built with Tauri 2, React 19, Vite, TypeScript (strict, `noUncheckedIndexedAccess`), Tailwind v4, shadcn/ui (Radix), Zustand and React Router. One app holds two **products** on one shared canvas engine: **Board** (`.cboard`, FigJam-style; the editor is at `/board/:id` and is being rebuilt on the element architecture, see Elements) and **Design** (`.cdesign`, Figma-style; only a skeleton and a placeholder page at `/design/:id`). Roadmap: desktop with local files, then a web build of the same frontend, then real-time collaboration (Yjs + Hocuspocus, Laravel backend). It must build on both Windows 11 and Arch Linux.

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

## Project structure

`src/` is the frontend (shared by the desktop app and the future web build). `src-tauri/` stays next to it: it's the Rust crate for the desktop shell, built by cargo, and the Tauri CLI expects it at the root.

```
src/
  app/          shell: entry, router, providers, theme sync, MCP server wiring (app/mcp)
  platform/     Tauri implementations of the shared/core interfaces (storage, dialogs, agent channel)
  shared/       app-wide, product-agnostic
    core/       plain TS: ids, files, keyboard, Storage/AgentChannel interfaces, MCP protocol
    ui/         design system: tokens, shadcn components, layout, hooks, brand
    stores/     Zustand stores for app UI state (theme, recent files, agent server)
    agent-server/  the "Agents" menu shown in every top bar
  canvas/       the canvas engine every product shares (plain TS, no React, no product code)
  canvas-ui/    React pieces every editor shares: hosting an engine, chrome components
  products/
    board/      engine side: product definition, elements, tools, palette, agent tools, file format
      ui/       the board editor (React)
    design/     skeleton: empty product definition and kinds
      ui/       placeholder page
  pages/        app pages that aren't a product: home, design-system
```

### Layering (enforced by ESLint `no-restricted-imports`)

Path aliases: `@app/*`, `@pages/*`, `@platform`, `@shared/*` (`@shared/core`, `@shared/ui/…`, `@shared/stores/…`, `@shared/agent-server`), `@canvas`, `@canvas-ui`, `@board`, `@design` (`@board/ui`, `@design/ui` for the editors). They're defined in both `tsconfig.json` and `vite.config.ts`, so keep the two in sync (`components.json` uses them too).

- **Engine code is plain TypeScript**, so the web version can reuse it: `shared/core`, `canvas/`, and `products/*` outside `ui/` may not import React, UI layers (`@shared/ui`, `@shared/stores`, `@canvas-ui`, `@pages`, `@app`) or platform code (`@platform`, `@tauri-apps/*`).
- **Lower layers never know higher ones:** `shared/` can't import `@canvas`/`@canvas-ui`; `shared/`, `canvas/` and `canvas-ui/` can't import products. **Products can't import each other.**
- A product's `ui/` uses its own engine side through its barrel (`@board`), plus `@canvas`, `@canvas-ui` and `@shared/*`.
- Platform access goes through interfaces in `shared/core` (e.g. `Storage` in `storage.types.ts`), implemented in `platform/` (Tauri).
- Business logic lives in TypeScript, not Rust. `src-tauri/` registers plugins (dialog, fs), holds window config/capabilities and runs the agent server's HTTP transport (`src-tauri/src/mcp/`, which carries no MCP logic).
- Ids come from `createId()` (`crypto.randomUUID()`), never auto-increment.
- Zustand stores (`shared/stores/`) hold app UI state only, never canvas content.

## Canvas engine (`src/canvas/`)

The engine is the same for every product. **A product is a `CanvasProduct`** (`canvas-product.types.ts`): its `kinds` (`ElementKinds`), `createTools(ctx)` (added after the built-in select and hand tools), `keybindings` and `defaultOptions`. `O` is the product's tool options type, threaded through `CanvasEngine<O>`, `ElementKind<E, O>`, `ToolContext<O>` and `EngineState<O>`. The board's is `boardProduct` (`products/board/board-product.ts`), the design's is `designProduct`.

- `CanvasEngine` (`canvas-engine.ts`) is a coordinator, created with `{ product, theme, document? }`. It wires the pieces together:
  - `CanvasDocument`: the content, a Yjs doc.
  - `Camera`
  - `Scene`: element list, selection, hover and marquee, plus spatial queries.
  - `Renderer`: PixiJS.
  - The tools.
  - Input modules: pointer, wheel and keyboard.
  - `TextEditor`: a DOM textarea overlay.

  It exposes `kinds`, `keymap`, `commands` and `elementInfo(type)` to hosts.

- **Registries are per product, never global.** Everything that needs an element's kind (document, scene, renderer, overlay, text editor, tools via `ctx.kinds`, agent helpers) gets the product's `ElementKinds` and calls `kinds.kindOf(el)`.
- **Content lives only in the Yjs doc.** Each element is a `Y.Map` inside the `"shapes"` map (the name is kept so existing files load). Order is a fractional-index string (`index`), and lexicographic order is z-order.
  - All edits go through `CanvasDocument` methods (`add`, `update`, `updateMany`, `remove`), which transact with `LOCAL_ORIGIN` so `Y.UndoManager` tracks only local changes.
  - Call `doc.checkpoint()` before a user action to start a new undo step.
  - A document reads elements through the product's kinds (`new CanvasDocument(kinds)`, `CanvasDocument.fromUpdate(kinds, bytes)`): `doc.get`/`doc.all` return only registered types, with `kind.fillDefaults` applied. Elements of unregistered types (e.g. DB or ER shapes in older boards) stay in the doc untouched but aren't shown.
- **Data flow is one-way.** Tools write to the document, and `doc.observe` reports `{ updated, removed }` ids. The engine then refreshes the `Scene`, syncs only the changed Pixi views (`render/layers/element-layer.ts`) and requests a frame.
  - Rendering is on demand: Pixi uses `autoStart: false`, and `FrameScheduler` renders at most once per animation frame.
- **Tools** implement `Tool` (`tools/tool.types.ts`, `id: string`) and act only through `ToolContext`, never through the engine directly. Select and hand are built in (`createBaseTools`); a product adds its own in `createTools`. A tool previews an element it's creating with `ctx.setDraft(el)`: the draft layer draws it with its kind, like any element. Other gesture feedback (a line being dragged, a drop target) is a `Guide` set with `ctx.setGuide(fn)`, drawn above the elements.
- **Product hooks** keep product features out of the engine:
  - `createLinks()` returns `CanvasLinks` (`links/`): lines derived from the elements (e.g. database relations), re-resolved on every document change and drawn under the elements, highlighted when they touch the selection.
  - `onRemove(doc, removed)` cleans up after deletions (e.g. clears refs to deleted tables), inside the same undo step.
  - Kinds offer `interactionAt` and `handles` (see Elements), which the select tool and overlay use.
- **Commands and shortcuts:** every engine action is a command (`commands.ts`), and every tool gets `tool.<id>`. **A product's `keybindings` are the single source for shortcuts**: `BASE_KEYBINDINGS` (`input/base-keybindings.ts`) plus its tools' (e.g. `products/board/board-keybindings.ts`). The engine wraps them in a `Keymap`; the UI reads labels with `engine.keymap.label(command)`, so never hard-code shortcut strings in components. Key matching and formatting helpers live in `shared/core/keyboard.ts` (shared with the `useHotkey` hook in `shared/ui/hooks/`).
- **UI state** is exposed as an immutable `EngineState` snapshot (`utils/store.ts`, shallow-compared), via `engine.subscribe` / `engine.getState`.
- **Agent helpers** (`agent/`): `AgentTool<H>` (generic over what the tool can reach), argument parsers (`tool-args.ts`), `asUndoStep(doc, edit)`, and `buildElement` / `elementPatch` / `summarizeElement`, which go through the kinds. Products assemble their MCP tools from these.

## Elements

Everything on a canvas is an element. **Elements are plain data and behavior lives in kind classes.** Never branch on `el.type` outside an element's folder: ask its kind. The framework is in `canvas/elements/`; the element types live in their product (`products/board/elements/`).

- **Data:** every element extends the `CanvasElement` interface (`id`, `type: string`, `index`, `x`, `y`, `w`, `h`) in `element.types.ts`. They're plain JSON because they live in the Yjs doc. **The set of types is open:** there's no closed union of types, so plugins can add types the engine has never heard of. Code outside an element's folder only sees `CanvasElement` and asks its kind. Patches are `ElementPatch<E>` (typed by the kind for its element), and the document takes the base `ElementPatch`.
- **Behavior:** each type has one `ElementKind<E, O>` subclass (`element.kind.ts`), registered in its product's `ElementKinds` (`element.kinds.ts`, a `Registry` from `utils/registry.ts` that throws on duplicate keys; the board's is `boardKinds` in `products/board/elements/board-kinds.ts`). `kinds.kindOf(el)` returns it, and `kinds.isElement(data)` is true only for registered types. Every kind declares its metadata: `label`, `description` (tooltips, listings) and `tool`, the id of the tool that creates it. The hotkey isn't stored on the kind: `engine.elementInfo(type)` reads it from the keymap through `tool`. The toolbar takes element tools' label and description from `elementInfo`. A kind can provide:
  - `draw`, `bounds`, `hitTest`
  - `move`, `resizable` / `resize`
  - `text`: an `ElementText` spec (`get`, `set`, `style`) that the `TextEditor` and the drawer share, so edited text lines up with drawn text
  - `fillDefaults` (for older files)
  - `describe` (agent summaries)
  - `optionsOf` / `restyle` (the tool options panel, typed with the product's options `O`)
  - `interactionAt(el, p, query)`: part of the element a press grabs before selecting it (a handle, a button). It returns an `ElementInteraction` (`cursor`, `press(ctx, p)`); `press` runs a one-shot action or returns an `ElementGesture` (`move`, `finish`, `cancel`, `onCameraChange`) that the select tool drives. Resize handles of the single selection win over it.
  - `handles(el)`: points the overlay draws while the element is selected or hovered
  - `build` from an `ElementSpec` (agents' `create_shapes`), plus `creatable` and `patchableFields`
- **Shared bases** (`canvas/elements/bases/`). Anything several types do goes in a base, never copied into each kind:
  - `BoxKind`: hit anywhere in the bounds, resizable.
  - `TextBoxKind extends BoxKind`: in-place `text` (get, set, describe). Subclasses only give `textStyle`.
  - `LineKind`: hit near a polyline `points`.
  - `ElementKind.specRect` turns a spec into bounds for `build`.
  - Factories start from `createElementBase(type, rect, index)` (`element.factory.ts`: id, type, index, bounds) and spread their own fields on top. The editor's aria label is `${kind.label} text`.
- **One folder per type** (in the product's `elements/`). Files are named `<name>.<role>.ts` so the role shows in the name:
  - `<type>.types.ts`: the data interface
  - `<type>.factory.ts`: `create<Type>()`, pure data with no rendering
  - `<type>.draw.ts`: the Pixi drawer
  - `<type>.kind.ts`: the `ElementKind` subclass
  - `<type>.defaults.ts`: one typed object (`STICKY_DEFAULTS`, `GEO_DEFAULTS`) that satisfies its `<Type>Defaults` interface, which extends `ElementDefaults` (`size?`, `fontSize?`). The kind exposes it as `kind.defaults`, so generic code (e.g. `loadFonts`) reads defaults through the kinds and never names a type's constants. Values every element shares (font family, line height, minimum size) are in `ELEMENT_DEFAULTS` (`canvas/elements/element.defaults.ts`). No loose constants.
  - `index.ts`: the folder's exports

  Extra pieces follow the same pattern (`stroke.outline.ts`, `geo/variants/<id>.variant.ts`, `variant.registry.ts`, `bases/box.kind.ts`), and one-off helpers keep plain names (`ellipse-arc.ts`). Element folders import the framework from `@canvas`. The board's types are:
  - `sticky/`: `StickyKind extends TextBoxKind`
  - `stroke/`: `StrokeKind extends LineKind`; only moved, and not created by agents
  - `db/`: the database schema, one family in one folder:
    - `card/`: `DbCardKind`, the base of tables and enums (sized by content, not resizable, created by the `db` tool or DBML, never from an agent's spec; agents may only move them) and the card frame drawer and row layout.
    - `table/`: `DbTableKind`. Columns are a plain JSON array; a relation lives on the source column (`column.ref`) and points at the target by table/column **id**, so moves and renames never break it. Tables keep `indexes` and a `note`, drawn as bubbles beside the table (`noteHidden` is view state, written with `doc.updateUntracked`). A column's `type` is the bare name (`varchar`) and its arguments live in `typeArgs` (`column-type.ts`; aliases like `int` → `integer` are normalized, `type-aliases.ts`). The kind offers the note ×/icon and the column handles (`db-table.interactions.ts`); dragging a handle runs `ColumnConnectGesture`, which links the dropped-on row (a header means its primary key).
    - `enum/`: `DbEnumKind`; columns use an enum by naming it as their type.
    - `schema/`: tables, enums and stickies with a `noteName` (DBML sticky notes) form the board's single schema. `DbSchema` is the facade and the only place that edits it (`table-edits.ts`, `enum-edits.ts`, `schema-dbml.ts`); it observes the document only while something subscribes, so it needs no cleanup. DBML is a generated view (`dbml/`: a hand-written parser and serializer for a subset). Parsed text goes through `reconcile*.ts`, which match by name then position so ids survive; `add-missing-tables.ts` creates tables that refs name but nothing defines (on import, paste and blur only).
    - `links/`: `DbLinks`, the board's `CanvasLinks` for relations (crow's feet) and enum links. `pruneRefs` is the board's `onRemove`.
  - `geo/`: `GeoKind extends TextBoxKind`, which delegates the outline to the element's variant. Each variant (`kind`: rectangle, ellipse, diamond, …) is a `GeoVariant` subclass in `geo/variants/<id>.variant.ts`, registered at runtime in `geoVariants` (`variant.registry.ts`), with its label, picker `icon` (an SVG path), default size, `outline` and optional `decorate`. `variantOf(id)` falls back to the rectangle for unknown ids. The shape picker lists `geoVariants.all()`. `PolygonVariant` covers the polygon ones.

- **Adding a type to a product:**
  1. Create its folder in the product's `elements/`.
  2. Register it: `boardKinds.register(new MyKind())` (built-ins in `board-kinds.ts`, plugins before the file opens).
  3. If it has a tool: add the tool to the product's `createTools` and its `tool.<id>` shortcut to the product's keybindings.

  Agents' `create_shapes` schema, `loadFonts` and `elementInfo` read the registry live. A geo variant is the same: `geoVariants.register(new MyVariant())`.

- **Rendering:** `ElementView` (`canvas/render/element-view.ts`) is the one Pixi container for every element. `sync(el, kind)` calls `kind.draw(view, el)`, and `view.placeText(text, style, w, h)` lays text out like the editor. Nothing outside the element folders knows how an element looks.

### Staged rebuild (`temporal/`)

The board is being rebuilt on the element architecture one type at a time. Only `sticky`, `stroke`, `geo` and the database types (`db/`) exist so far. The code for text, connectors, sections and ER diagrams (engine modules, tools, layers, agent tools and their panels) was moved to `temporal/`, together with reference copies of the core files from before the rebuild. Its paths mirror the **old** `src/` layout (`src/engine/…`); `temporal/README.md` maps them to the new one and keeps the old architecture notes for those features. `temporal/` isn't compiled, linted or formatted. To bring a feature back, port it into the board product (an `elements/<type>/` folder, its tool, agent tools and panel), then delete what it replaced from `temporal/`.

## Agent (MCP) server

Agents (Claude Code, Cursor, …) connect to the running app at `http://127.0.0.1:47821/mcp`. If that port is taken the server tries the next nine, and the URL is written to `mcp.json` in the app data folder. Access is on by default, with no auth: only loopback, with Host and Origin checked against DNS rebinding.

- **Rust is only the transport** (`src-tauri/src/mcp/`): stateless Streamable HTTP (POST only). Each body is emitted to the webview as `mcp://message` and answered through the `mcp_reply` command (30 s timeout). `mcp_status` and `mcp_set_enabled` back the UI.
- **The protocol is TypeScript.** `shared/core/mcp/handle-mcp-message.ts` is a small hand-written JSON-RPC handler (`initialize`, `ping`, `tools/list`, `tools/call`). It reaches the platform through the `AgentChannel` interface (`shared/core/agent-channel.types.ts`, `platform/tauri-agent-channel.ts`), and `agentChannel` is `null` outside Tauri.
- **The board's tools are a registry in `products/board/agent/`**: one group per file (`board-read-tools`, `shape-edit-tools`, `db-tools`, `view-tools`, `file-tools`), listed in `create-agent-tools.ts`. A tool is an `AgentTool<AgentHost>` and gets the `AgentHost` (the open board, recent files, opening a board). Every editing tool wraps its writes in `asUndoStep(engine.doc, …)` so one call is one Ctrl+Z, and builds or validates everything before writing. Element tools go through the kinds (the canvas `buildElement`, `elementPatch`, `summarizeElement` with `engine.kinds`). The MCP names still say "shapes" (`create_shapes`, …) so agents' setups keep working.
- **The app wires it up** in `app/mcp/` (`useAgentServer`, mounted by `<AgentServer />` in the providers). The open board registers itself for agents with `useAgentBoard` (`products/board/ui/agent/`). The on/off setting is `shared/stores/agent-server-store.ts`, and `shared/agent-server/` is the menu in both top bars that copies the URL and setup.

## Editors (React)

- **Shared host (`canvas-ui/`):** `useCanvasEngine(containerRef, product, document)` creates and mounts an engine into a container div; the canvas theme is resolved from CSS tokens via `readCanvasTheme()`. The engine is provided through `EngineContext`, and chrome components use `useEngine()` and `useEngineState(selector)`, selecting primitives or stable references so each one re-renders only for its slice. The generic chrome is here too (`FloatingPanel`, `ToolButton`, `OptionButton`, `ColorSwatch`, `ZoomControls`, `HistoryControls`).
- **Board editor (`products/board/ui/`):** `BoardEditorPage` (`/board/:id`) loads the document and mounts the engine with `boardProduct`. `BoardSession` also creates the board's `DbSchema` (`useDbSchema`) and provides it through `BoardSchemaContext`; panels read it with `useBoardSchema()` and `useDbQuery`/`useDbTable`/`useDbEnum` (`ui/schema/`), which re-read only when the schema changes. The database panel (`components/db-panel/`, with the DBML `source-editor/`) shows the selected table or enum (`selectedId` + `selectionTypes` from `EngineState`), or the whole schema from the top bar's button (`ui/stores/board-panel-store.ts`); `.dbml` import/export goes through `@platform`. Board components that read or set tool options use `useBoardEngine()` / `useBoardState()` (`board-engine-context.ts`), typed with `BoardToolOptions`. The tool options panels (`components/tool-options/`) follow the active tool, or the selection's element type with the select tool.
- **Never put canvas elements in React state.** React only hosts the canvas and draws the UI around it.
- **Files:** `products/board/ui/file/` loads the board's `CanvasDocument` from `Storage` (or starts an empty one for a new id) and saves it. A `.cboard` file is the `CCBD` magic, a u32 format version and a Yjs update (`products/board/file/board-file.ts`). `TauriStorage` keeps a recent-files index (id → path) in the app data folder. Ctrl+S / Ctrl+Shift+S are engine commands that call the host's `setHostActions`.
- **Adding a product** (the design editor): fill in its `CanvasProduct` (kinds, tools, keybindings, options) and build its `ui/` editor from `canvas-ui` like the board's.

## Code conventions

- **Small, single-purpose files:** one component, tool, layer or helper per file, re-exported through a folder `index.ts`. Split a file once it mixes concerns or grows past ~200 lines. Reuse the shared helpers before writing new ones:
  - `canvas/utils`: `Store`, `Emitter`, `Disposables`, `FrameScheduler`, `Registry`, `debounce`, `clamp`/`mod`.
  - `shared/core/keyboard.ts`
  - `shared/ui/layout`: `AppHeader`, `PageContainer`.
  - `shared/ui/hooks`
  - `canvas-ui` for editor chrome.
- **Types go in sibling `<file>.types.ts` files:**
  - Every `interface` and `type`, including component props, goes in a `.types.ts` file next to its code, and is imported with `import type`.
  - Barrels re-export them with `export type`.
  - Vendored shadcn primitives in `src/shared/ui/components/ui/` are exempt and stay as generated.

## Design system

- **Tokens** live in `src/shared/ui/styles/tokens.css` and are mapped to Tailwind in `src/app/styles.css`. Tailwind's default colors and radii are reset, so only design-system values exist.
  - Components use **semantic tokens only** (`bg-surface`, `text-muted-foreground`, `bg-primary`, …). They never hard-code colors or use the palette scales (`ice`, `seal`, `blush`, `sand`, `lilac`).
  - Canvas colors are tokens too (`--canvas-*`).
  - Document content colors (sticky/marker palettes in `products/board/palette.ts`) are data saved with the file, not theme tokens.
- **Sharp shapes:** the user dislikes rounded styles.
  - Radii are 4px for controls (`rounded-md`) and 6px for cards and menus (`rounded-card`/`rounded-lg`), with 8px as the maximum.
  - No pills.
- **Roles:** primary = ice blue, secondary = seal gray, accent = blush peach (use sparingly), board = sand, design = lilac. The mascot/logo is a "foca watona" (spotted seal) peeking over a canvas (`src/shared/ui/brand/`).
- **Light theme only for now.** `FORCE_LIGHT_THEME` in `src/shared/stores/theme-store.ts` (mirrored in the `index.html` bootstrap script) disables dark mode. The `.dark` tokens and the theme plumbing are kept for later.
