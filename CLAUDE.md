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
- Business logic lives in TypeScript, not Rust. `src-tauri/` registers plugins (dialog, fs, clipboard-manager, opener, single-instance), holds window config/capabilities and file associations, runs the agent server's HTTP transport (`src-tauri/src/mcp/`, which carries no MCP logic) and hands over the paths the OS asks to open (`src-tauri/src/open_files.rs`).
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
  - `TextEditor`: a DOM textarea overlay. Tools type a new element's text with `ctx.editNewText(draft)`: the draft is added to the document (and selected) only when the edit is committed with some text.

  It exposes `kinds`, `keymap`, `commands` and `elementInfo(type)` to hosts.

- **Registries are per product, never global.** Everything that needs an element's kind (document, scene, renderer, overlay, text editor, tools via `ctx.kinds`, agent helpers) gets the product's `ElementKinds` and calls `kinds.kindOf(el)`.
- **Content lives only in the Yjs doc.** Each element is a `Y.Map` inside the `"shapes"` map (the name is kept so existing files load). Order is a fractional-index string (`index`), and lexicographic order is z-order.
  - All edits go through `CanvasDocument` methods (`add`, `update`, `updateMany`, `remove`), which transact with `LOCAL_ORIGIN` so `Y.UndoManager` tracks only local changes.
  - Call `doc.checkpoint()` before a user action to start a new undo step.
  - Binary data (image files) lives in the doc's `"assets"` map (`doc.addAsset`, `doc.getAsset`), keyed by a `createId()` id that elements point at. It's outside the undo history and shared by copies of an element; nothing deletes unused assets yet. Kinds name the assets an element shows with `kind.assets(el)`. The renderer decodes each one once into a texture (`render/image-cache.ts`), and a drawer shows it with `view.placeImage(assetId, box)` (fitted, proportions kept).
  - A document reads elements through the product's kinds (`new CanvasDocument(kinds)`, `CanvasDocument.fromUpdate(kinds, bytes)`): `doc.get`/`doc.all` return only registered types, with `kind.fillDefaults` applied. Elements of unregistered types (e.g. DB or ER shapes in older boards) stay in the doc untouched but aren't shown.
- **Data flow is one-way.** Tools write to the document, and `doc.observe` reports `{ updated, removed }` ids. The engine then refreshes the `Scene`, syncs only the changed Pixi views (`render/layers/element-layer.ts`) and requests a frame.
  - Rendering is on demand: Pixi uses `autoStart: false`, and `FrameScheduler` renders at most once per animation frame.
- **Tools** implement `Tool` (`tools/tool.types.ts`, `id: string`) and act only through `ToolContext`, never through the engine directly. Select and hand are built in (`createBaseTools`); a product adds its own in `createTools`. A tool previews an element it's creating with `ctx.setDraft(el)`: the draft layer draws it with its kind, like any element. Other gesture feedback (a line being dragged, a drop target) is a `Guide` set with `ctx.setGuide(fn)`, drawn above the elements.
- **Product hooks** keep product features out of the engine:
  - `createLinks()` returns `CanvasLinks` (`links/`): lines derived from the elements (e.g. database relations), re-resolved on every document change and drawn under the elements, highlighted when they touch the selection.
  - Links can show text with `view.label(text, at, options)` (pooled text nodes, e.g. ER cardinalities).
  - `resolveElements(elements)` gives elements whose geometry follows others (ER aggregation boxes, constraints) their current geometry: `Scene.refresh()` runs it, and the elements it replaced are redrawn on every change. **Read geometry from the scene** (`engine.getElement`, `ctx.getElement`), not from `doc.get`; the stored bounds of derived elements are stale. The text editor places itself from the scene too.
  - `withMembers(ids, elements, purpose)` adds what goes with the ids when they're moved (`ctx.withMembers` in the select tool) or deleted (`engine.deleteElements`), e.g. an entity's attributes.
  - `onRemove(doc, removed, before)` cleans up after deletions (e.g. clears refs to deleted tables, frees connector ends), inside the same undo step. `before` is the scene as it was, so resolved geometry of removed elements is still readable.
  - `prepareCopies(copies, { copied, existing })` fixes copied elements before they're added (the board: free DB names via `prepareDbCopies`, a new ER diagram per source diagram via `prepareErCopies`, loose connector ends via `prepareConnectorCopies`). `pasteText(text, at, index, options)` turns text pasted from outside the app into an element (the board: a text element), and `pasteImage(image, view, index, options)` an image (the board: an image element, `createPastedImage`).
- **Frames:** a kind with `frame = true` (ER aggregation boxes, sections) is drawn in its own layer behind the links and the other elements, larger frames further back (`zOrderKey`, `elements/z-order.ts`), and a marquee selects it only when it encloses it.
- **Feeds:** board-level facades (`DbSchema`, `ErModel`) notify React through a `DocumentFeed` (`document/document-feed.ts`), which observes the document only while someone subscribes, so they need no cleanup and can be created in a `useMemo`.
  - Kinds offer `interactionAt` and `handles` (see Elements), which the select tool and overlay use.
- **Copy and paste** (`clipboard/`): `ElementClipboard` copies the selection with what moves with it (`withMembers(…, "move")`), as scene elements, to the system clipboard as JSON (`encodeClipboard`/`decodeClipboard`, tagged with the product id, with the assets they show in base64 so images paste into other files). `insertCopies` clones them (`cloneElements`: fresh ids and indexes, and `remapIds` rewrites every string equal to a copied id, so references between copies follow without knowing the types), runs the product's `prepareCopies`, offsets them with `kind.move` and adds them as one undo step. Pastes land 20 units further each time while the source is in view, otherwise centered in it. Anything else on the clipboard goes through `paste-external.ts`: an image (preferred over text) becomes an asset plus the product's `pasteImage` element, and text goes to `pasteText`. The system clipboard is the `Clipboard` interface (`shared/core/clipboard.types.ts`: text, plus `readImage()` as an encoded file; `platform/clipboard.ts`: Tauri's clipboard manager, whose RGBA images are encoded to PNG, or `navigator.clipboard` in the browser), passed as `CanvasEngineOptions.clipboard` by `useCanvasEngine`; without one, the engine uses a `MemoryClipboard`. The commands are `copy`, `cut`, `paste` and `duplicate` (Ctrl+D). Alt-dragging with the select tool duplicates in place (`ctx.duplicate`) and drags the copies.
- **Commands and shortcuts:** every engine action is a command (`commands.ts`), and every tool gets `tool.<id>`. **A product's `keybindings` are the single source for shortcuts**: `BASE_KEYBINDINGS` (`input/base-keybindings.ts`) plus its tools' (e.g. `products/board/board-keybindings.ts`). The engine wraps them in a `Keymap`; the UI reads labels with `engine.keymap.label(command)`, so never hard-code shortcut strings in components. Key matching and formatting helpers live in `shared/core/keyboard.ts` (shared with the `useHotkey` hook in `shared/ui/hooks/`).
- **UI state** is exposed as an immutable `EngineState` snapshot (`utils/store.ts`, shallow-compared), via `engine.subscribe` / `engine.getState`.
- **Agent helpers** (`agent/`): `AgentTool<H>` (generic over what the tool can reach), argument parsers (`tool-args.ts`), `asUndoStep(doc, edit)`, and `buildElement` / `elementPatch` / `summarizeElement`, which go through the kinds. Products assemble their MCP tools from these.

## Elements

Everything on a canvas is an element. **Elements are plain data and behavior lives in kind classes.** Never branch on `el.type` outside an element's folder: ask its kind. The framework is in `canvas/elements/`; the element types live in their product (`products/board/elements/`).

- **Data:** every element extends the `CanvasElement` interface (`id`, `type: string`, `index`, `x`, `y`, `w`, `h`) in `element.types.ts`. They're plain JSON because they live in the Yjs doc. **The set of types is open:** there's no closed union of types, so plugins can add types the engine has never heard of. Code outside an element's folder only sees `CanvasElement` and asks its kind. Patches are `ElementPatch<E>` (typed by the kind for its element), and the document takes the base `ElementPatch`.
- **Behavior:** each type has one `ElementKind<E, O>` subclass (`element.kind.ts`), registered in its product's `ElementKinds` (`element.kinds.ts`, a `Registry` from `utils/registry.ts` that throws on duplicate keys; the board's is `boardKinds` in `products/board/elements/board-kinds.ts`). `kinds.kindOf(el)` returns it, and `kinds.isElement(data)` is true only for registered types. Every kind declares its metadata: `label`, `description` (tooltips, listings) and `tool`, the id of the tool that creates it. The hotkey isn't stored on the kind: `engine.elementInfo(type)` reads it from the keymap through `tool`. The toolbar takes element tools' label and description from `elementInfo`. A kind can provide:
  - `draw`, `bounds`, `hitTest`
  - `move`, `resizable` / `resize`, `keepsRatio` (always resize proportionally, not only with Shift)
  - `assets(el)`: the document assets it shows (e.g. an image's file)
  - `text`: an `ElementText` spec (`get`, `set`, `style`) that the `TextEditor` and the drawer share, so edited text lines up with drawn text. `fitContent` sizes the element to its unwrapped text (the editor grows while typing), and `removeWhenEmpty` deletes it when its text is emptied
  - `fillDefaults` (for older files)
  - `describe` (agent summaries), `completePatch` (fields that follow from an agent's patch, e.g. a text's size)
  - `optionsOf` / `restyle` (the tool options panel, typed with the product's options `O`)
  - `text.style(el).singleLine`: a one-line text (a name), where Enter finishes editing
  - `interactionAt(el, p, query)`: part of the element a press grabs before selecting it (a handle, a button). It returns an `ElementInteraction` (`cursor`, `press(ctx, p)`); `press` runs a one-shot action or returns an `ElementGesture` (`move`, `finish`, `cancel`, `onCameraChange`) that the select tool drives. Resize handles of the single selection win over it.
  - `handles(el, zoom)`: `ElementHandle`s the overlay draws while the element is selected or hovered (`look: "dot"` for small actions). A hovered element with handles stays hovered a little outside its bounds, so handles drawn outside it can be reached.
  - `boxed`: whether selection and hover outline its bounds (`false` for connectors, which show their ends)
  - `connectable` and `anchor(el, side)`: whether connectors attach to it, and where on each `ElementSide` (`BoxKind` is connectable; geo variants give their own `sideAnchor`)
  - `build(spec, index, context)` from an `ElementSpec` (agents' `create_shapes`), plus `creatable` and `patchableFields`. Type-specific spec fields are declared in `specProperties` (merged into the `create_shapes` schema) and read from `spec.args`; `context.lookup(ref)` finds elements by id or by a `key` given earlier in the same call.
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
  - `sticky/`: `StickyKind extends QuickConnectKind` (a `TextBoxKind`)
  - `connector/`: `ConnectorKind extends LineKind`. Each end (`start`, `end`) is free (`x`, `y`) or attached to a connectable element (`shapeId`, optional `side`). Its route (`straight` or `elbow`, `elbow-route.ts`), bounds and `points` are derived by `resolveConnectors`, part of the board's `resolveElements` (after the ER pass), so **read connectors from the scene**. Moving one moves only its free ends; `detachConnectors` (the board's `onRemove`) frees ends whose element was deleted. Selected, it shows its ends, which drag with `ConnectorDrag` (also used by the `connector` tool). `QuickConnectKind` (the base of `StickyKind` and `GeoKind`) shows a dot beside each side that drags out a new connector.
  - `text/`: `TextKind`, a free label sized to its text (`fitContent`, `removeWhenEmpty`), not resizable. The `text` tool types a draft, or edits the text of whatever it clicks.
  - `stroke/`: `StrokeKind extends LineKind`; only moved, and not created by agents
  - `db/`: the database schema, one family in one folder:
    - `card/`: `DbCardKind`, the base of tables and enums (sized by content, not resizable, created by the `db` tool or DBML, never from an agent's spec; agents may only move them) and the card frame drawer and row layout.
    - `table/`: `DbTableKind`. Columns are a plain JSON array; a relation lives on the source column (`column.ref`) and points at the target by table/column **id**, so moves and renames never break it. Tables keep `indexes` and a `note`, drawn as bubbles beside the table (`noteHidden` is view state, written with `doc.updateUntracked`). A column's `type` is the bare name (`varchar`) and its arguments live in `typeArgs` (`column-type.ts`; aliases like `int` → `integer` are normalized, `type-aliases.ts`). The kind offers the note ×/icon and the column handles (`db-table.interactions.ts`); dragging a handle runs `ColumnConnectGesture`, which links the dropped-on row (a header means its primary key).
    - `enum/`: `DbEnumKind`; columns use an enum by naming it as their type.
    - `schema/`: tables, enums and stickies with a `noteName` (DBML sticky notes) form the board's single schema. `DbSchema` is the facade and the only place that edits it (`table-edits.ts`, `enum-edits.ts`, `schema-dbml.ts`); it observes the document only while something subscribes, so it needs no cleanup. DBML is a generated view (`dbml/`: a hand-written parser and serializer for a subset). Parsed text goes through `reconcile*.ts`, which match by name then position so ids survive; `add-missing-tables.ts` creates tables that refs name but nothing defines (on import, paste and blur only).
    - `links/`: `DbLinks`, the board's `CanvasLinks` for relations (crow's feet) and enum links. `pruneRefs` is the board's `onRemove`.
  - `er/`: ER diagrams (Chen notation with the extended model; the language is documented in `docs/er-language.md`), one family in one folder:
    - `base/`: `ErKind` (part of a diagram; created by the `er` tool or the ER text, never from an agent's spec; agents may only move them), `ErNamedKind` (the name is edited in place on one line; elements sized by their name resize round their center), `ER_DEFAULTS`, sizes (`er-size.ts`), outlines (`er-outline.ts`) and the shared types. Every element has `diagram` (an id) and `diagramName` (repeated on each element of the diagram): **a board holds several diagrams**.
    - One folder per type: `entity/` (rectangle, doubled when `weak`), `relation/` (diamond, `identifying`, `idMark`; `participants` point **by id** at entities or aggregations, with `(min,max)`, a role and `arrow`), `attribute/` (`ownerId` is an entity, relation, composite attribute, hierarchy or aggregation; key/multi/derived/optional flags, a `look`, an `order`), `isa/` (hierarchy triangle with `parentId` and children), `aggregate/` (a frame, hit by its name strip or border) and `constraint/` (hit near its line). Aggregations' and constraints' geometry is derived (`model/resolve-er.ts`, the board's `resolveElements`).
    - `model/`: `ErModel` (board-level facade: `diagram(id)`, `diagrams()`, `shape(id)`, `remove(id)`, `newDiagram(center?)`) and `ErDiagram` (`text()`, `applyText`, `textRange`, `relayout`, `rename`, `edits`). The text is parsed with the DBML tokenizer (`lang/`) and reconciled by name then position so ids and positions survive (`reconcile-er.ts`, `reconcile-extended.ts`); `applyErPlan` writes one undo step and lays out new elements (`layout/`, deterministic auto-layout). `withErMembers` is the board's `withMembers` (an element takes its attributes; dragging an aggregation takes what it holds), `pruneEr` part of its `onRemove`. Boards from before diagrams existed are split into diagrams when the file opens (`migrateErDiagrams`, called by `openBoardDocument`).
    - `links/`: `ErLinks`, the lines (participants with cardinality labels, attributes, hierarchies; loops for self-relations).
  - `section/`: `SectionKind extends TextBoxKind`, a frame (`frame = true`) with its title edited in place in the strip along its top edge. It's hit by its title or border only, so clicks inside reach its contents. Membership is geometric: the elements fully inside it move and delete with it (`withSectionMembers`, part of the board's `withMembers`), so nothing stores parent links. The top bar's Sections menu (`ui/components/sections-menu/`) zooms to one.
  - `image/`: `ImageKind extends BoxKind`, a picture pasted from the clipboard (`assetId` points at the document asset). Its bounds include its `padding` (default 0) and its `background` is `"none"` (transparent, the default) or `"white"`, both picked in the options panel (`ui/components/tool-options/image-options.tsx`); changing the padding grows the bounds around the image. It always resizes proportionally (`keepsRatio`), isn't created by agents, and is only moved or resized by them.
  - `geo/`: `GeoKind extends QuickConnectKind`, which delegates the outline (and its connector `sideAnchor`s) to the element's variant. Each variant (`kind`: rectangle, ellipse, diamond, …) is a `GeoVariant` subclass in `geo/variants/<id>.variant.ts`, registered at runtime in `geoVariants` (`variant.registry.ts`), with its label, picker `icon` (an SVG path), default size, `outline` and optional `decorate`. `variantOf(id)` falls back to the rectangle for unknown ids. The shape picker lists `geoVariants.all()`. `PolygonVariant` covers the polygon ones.

- **Adding a type to a product:**
  1. Create its folder in the product's `elements/`.
  2. Register it: `boardKinds.register(new MyKind())` (built-ins in `board-kinds.ts`, plugins before the file opens).
  3. If it has a tool: add the tool to the product's `createTools` and its `tool.<id>` shortcut to the product's keybindings.

  Agents' `create_shapes` schema, `loadFonts` and `elementInfo` read the registry live. A geo variant is the same: `geoVariants.register(new MyVariant())`.

- **Rendering:** `ElementView` (`canvas/render/element-view.ts`) is the one Pixi container for every element. `sync(el, kind)` calls `kind.draw(view, el)`, and `view.placeText(text, style, w, h)` lays text out like the editor. Nothing outside the element folders knows how an element looks.

## Agent (MCP) server

Agents (Claude Code, Cursor, …) connect to the running app at `http://127.0.0.1:47821/mcp`. If that port is taken the server tries the next nine, and the URL is written to `mcp.json` in the app data folder. Access is on by default, with no auth: only loopback, with Host and Origin checked against DNS rebinding.

- **Rust is only the transport** (`src-tauri/src/mcp/`): stateless Streamable HTTP (POST only). Each body is emitted to the webview as `mcp://message` and answered through the `mcp_reply` command (30 s timeout). `mcp_status` and `mcp_set_enabled` back the UI.
- **The protocol is TypeScript.** `shared/core/mcp/handle-mcp-message.ts` is a small hand-written JSON-RPC handler (`initialize`, `ping`, `tools/list`, `tools/call`). It reaches the platform through the `AgentChannel` interface (`shared/core/agent-channel.types.ts`, `platform/tauri-agent-channel.ts`), and `agentChannel` is `null` outside Tauri.
- **The board's tools are a registry in `products/board/agent/`**: one group per file (`board-read-tools`, `shape-edit-tools`, `db-tools`, `er-tools`, `view-tools`, `file-tools`), listed in `create-agent-tools.ts`. A tool is an `AgentTool<AgentHost>` and gets the `AgentHost` (the open board, recent files, opening a board). Every editing tool wraps its writes in `asUndoStep(engine.doc, …)` so one call is one Ctrl+Z, and builds or validates everything before writing. Element tools go through the kinds (the canvas `buildElement`, `elementPatch`, `summarizeElement` with `engine.kinds`). The MCP names still say "shapes" (`create_shapes`, …) so agents' setups keep working.
- **The app wires it up** in `app/mcp/` (`useAgentServer`, mounted by `<AgentServer />` in the providers). The open board registers itself for agents with `useAgentBoard` (`products/board/ui/agent/`). The on/off setting is `shared/stores/agent-server-store.ts`, and `shared/agent-server/` is the menu in both top bars that copies the URL and setup.

## Editors (React)

- **Shared host (`canvas-ui/`):** `useCanvasEngine(containerRef, product, document)` creates and mounts an engine into a container div; the canvas theme is resolved from CSS tokens via `readCanvasTheme()`. The engine is provided through `EngineContext`, and chrome components use `useEngine()` and `useEngineState(selector)`, selecting primitives or stable references so each one re-renders only for its slice. The generic chrome is here too (`FloatingPanel`, `ToolButton`, `OptionButton`, `ColorSwatch`, `ZoomControls`, `HistoryControls`).
- **Board editor (`products/board/ui/`):** `BoardEditorPage` (`/board/:id`) loads the document and mounts the engine with `boardProduct`. `BoardSession` also creates the board's `DbSchema` (`useDbSchema`) and provides it through `BoardSchemaContext`; panels read it with `useBoardSchema()` and `useDbQuery`/`useDbTable`/`useDbEnum` (`ui/schema/`), which re-read only when the schema changes. The database panel (`components/db-panel/`, with the DBML `source-editor/`) shows the selected table or enum (`selectedId` + `selectionTypes` from `EngineState`), or the whole schema from the top bar's button (`ui/stores/board-panel-store.ts`); `.dbml` import/export goes through `@platform`. The ER panel (`components/er-panel/`) works the same way with the board's `ErModel` (`ErModelContext`, `useErModel`, `useErQuery`, `useErSelection` in `ui/er/`): it opens when an ER element is selected and shows that element's diagram, as a form for the selected element or as text. Board components that read or set tool options use `useBoardEngine()` / `useBoardState()` (`board-engine-context.ts`), typed with `BoardToolOptions`. The tool options panels (`components/tool-options/`) follow the active tool, or the selection's element type with the select tool.
- **Never put canvas elements in React state.** React only hosts the canvas and draws the UI around it.
- **Files:** `products/board/ui/file/` loads the board's `CanvasDocument` from `Storage` (or starts an empty one for a new id) and saves it. A `.cboard` file is the `CCBD` magic, a u32 format version and a Yjs update (`products/board/file/board-file.ts`). `TauriStorage` keeps a recent-files index (id → path) in the app data folder. Ctrl+S / Ctrl+Shift+S are engine commands that call the host's `setHostActions`.
  - The index is validated on read (`isFileInfo`), written atomically (temp file + rename) and edited one change at a time (`mutate`); an unreadable one is set aside as `recent-files.corrupt.json` (`storage.takeIndexReset()`). Saves are atomic too.
  - `useRecentFilesStore` holds the recents and the ids of `missing` files (re-checked on window focus), plus `open(path)`, `relocate(id)` and `forget(id)`. Home's cards show missing files with Locate… / Remove, and every card has a ⋯ and right-click menu (`use-file-actions.ts`).
  - Files dropped on the window, picked with "Open with" or passed on the command line arrive through `FileOpenRequests` (`shared/core`, `platform/tauri-file-open-requests.ts`) and are opened by `app/open-requests/`, which asks first when the open editor is dirty (`unsaved-changes-store`, set by `useBoardSaver`).
- **Toasts:** report failures with `notifyError(title, error)` or `toast({...})` (`shared/stores/toast-store.ts`), never only `console.error`. The `<Toaster />` is mounted in the providers.
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
