# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cloudy Canvas (by DarkRedgm) is a desktop-first Figma + FigJam app built with Tauri 2, React 19, Vite, TypeScript (strict, `noUncheckedIndexedAccess`), Tailwind v4, shadcn/ui (Radix), Zustand and React Router. It has two file types: **Board** (`.cboard`, FigJam-style; the editor is implemented at `/board/:id` and is being rebuilt on the element architecture, see Elements) and **Design** (`.cdesign`, Figma-style; still a placeholder at `/design/:id`). Roadmap: desktop with local files, then a web build of the same frontend, then real-time collaboration (Yjs + Hocuspocus, Laravel backend). It must build on both Windows 11 and Arch Linux.

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
  - `Scene`: element list, selection, hover and marquee, plus spatial queries.
  - `Renderer`: PixiJS.
  - The tools.
  - Input modules: pointer, wheel and keyboard.
  - `TextEditor`: a DOM textarea overlay.
- **Content lives only in the Yjs doc.** Each element is a `Y.Map` inside the `"shapes"` map (the name is kept so existing files load). Order is a fractional-index string (`index`), and lexicographic order is z-order.
  - All edits go through `BoardDocument` methods (`add`, `update`, `updateMany`, `remove`), which transact with `LOCAL_ORIGIN` so `Y.UndoManager` tracks only local changes.
  - Call `doc.checkpoint()` before a user action to start a new undo step.
  - `doc.get`/`doc.all` return only elements whose type is registered (`isElement`), with `kind.fillDefaults` applied. Elements of unregistered types (e.g. DB or ER shapes in older boards) stay in the doc untouched but aren't shown.
- **Data flow is one-way.** Tools write to the document, and `doc.observe` reports `{ updated, removed }` ids. The engine then refreshes the `Scene`, syncs only the changed Pixi views (`render/layers/element-layer.ts`) and requests a frame.
  - Rendering is on demand: Pixi uses `autoStart: false`, and `FrameScheduler` renders at most once per animation frame.
- **Tools** (`tools/`) implement `Tool` and act only through `ToolContext`, never through the engine directly.
- **Extension points are registries:**
  - New tool: add it to `tools/tool-ids.ts`, then `tools/create-tools.ts`.
  - New element type: see Elements below.
  - New shortcut or action: add it to `commands.ts` and `input/keymap.ts`.
- **`input/keymap.ts` is the single source for shortcuts.** The UI reads labels via `shortcutLabel(commandId)`, so never hard-code shortcut strings in components. Key matching and formatting helpers live in `core/keyboard.ts` (shared with the `useHotkey` hook in `ui/hooks/`).
- **UI state** is exposed as an immutable `EngineState` snapshot (`utils/store.ts`, shallow-compared), via `engine.subscribe` / `engine.getState`.

## Elements (`src/engine/elements/`)

Everything on the canvas is an element. **Elements are plain data and behavior lives in kind classes.** Never branch on `el.type` outside `elements/`: ask the element's kind.

- **Data:** every element extends the `CanvasElement` interface (`id`, `type`, `index`, `x`, `y`, `w`, `h`), and `AnyElement` is the union of all of them (`element.types.ts`). They're plain JSON because they live in the Yjs doc.
- **Behavior:** each type has one `ElementKind` subclass (`element-kind.ts`), registered in `ELEMENT_KINDS` (`element-registry.ts`). `kindOf(el)` returns it. A kind can provide:
  - `draw`, `bounds`, `hitTest`
  - `move`, `resizable` / `resize`
  - `text`: an `ElementText` spec (`get`, `set`, `style`) that the `TextEditor` and the drawer share, so edited text lines up with drawn text
  - `fillDefaults` (for older boards)
  - `describe` (agent summaries)
  - `optionsOf` / `restyle` (the tool options panel)
  - `build` from an `ElementSpec` (agents' `create_shapes`), plus `creatable` and `patchableFields`
- **Shared bases** (`bases/`): `BoxKind` (hit anywhere in the bounds, resizable) and `LineKind` (hit near a polyline `points`).
- **One folder per type**, holding `<type>.types.ts`, its defaults, `create-<type>.ts`, `draw-<type>.ts`, `<type>-kind.ts` and `index.ts`:
  - `sticky/`: `StickyKind extends BoxKind`
  - `stroke/`: `StrokeKind extends LineKind`; only moved, and not created by agents
  - `geo/`: `GeoKind extends BoxKind`, which delegates the outline to the element's variant. Each variant (`kind`: rectangle, ellipse, diamond, …) is a `GeoVariant` subclass in `geo/variants/`, registered in `GEO_VARIANTS`, with its label, default size, `outline` and optional `decorate`. `PolygonVariant` covers the polygon ones.
- **Adding a type:**
  1. Create its folder.
  2. Add it to `ElementType`, `AnyElement` and `ElementPatch` in `element.types.ts`.
  3. Register its kind in `ELEMENT_KINDS`.

  The mapped registry type makes the compiler require the kind.

- **Rendering:** `ElementView` (`render/element-view.ts`) is the one Pixi container for every element. `sync` calls `kindOf(el).draw(view, el)`, and `view.placeText(text, style, w, h)` lays text out like the editor.

### Staged rebuild (`temporal/`)

The board is being rebuilt on the element architecture one type at a time. Only `sticky`, `stroke` and `geo` exist so far. The code for text, connectors, sections, DB tables/enums and ER diagrams (engine modules, tools, layers, agent tools and their panels) was moved to `temporal/`, which mirrors the `src/` paths, together with reference copies of the core files from before the rebuild. `temporal/` isn't compiled, linted or formatted. Its `README.md` keeps the old architecture notes for those features. To bring a feature back, port it into an `elements/<type>/` folder (plus its tool and panel), then delete what it replaced from `temporal/`.

## Agent (MCP) server

Agents (Claude Code, Cursor, …) connect to the running app at `http://127.0.0.1:47821/mcp`. If that port is taken the server tries the next nine, and the URL is written to `mcp.json` in the app data folder. Access is on by default, with no auth: only loopback, with Host and Origin checked against DNS rebinding.

- **Rust is only the transport** (`src-tauri/src/mcp/`): stateless Streamable HTTP (POST only). Each body is emitted to the webview as `mcp://message` and answered through the `mcp_reply` command (30 s timeout). `mcp_status` and `mcp_set_enabled` back the UI.
- **The protocol is TypeScript.** `core/mcp/handle-mcp-message.ts` is a small hand-written JSON-RPC handler (`initialize`, `ping`, `tools/list`, `tools/call`). It reaches the platform through the `AgentChannel` interface (`core/agent-channel.types.ts`, `platform/tauri-agent-channel.ts`), and `agentChannel` is `null` outside Tauri.
- **Tools are a registry in `engine/agent/`**: one group per file (`board-read-tools`, `shape-edit-tools`, `view-tools`, `file-tools`), listed in `create-agent-tools.ts`. A tool gets an `AgentHost` (the open board, recent files, opening a board). Every editing tool wraps its writes in `asUndoStep` so one call is one Ctrl+Z, and builds or validates everything before writing. Element tools go through the kinds (`build-element.ts`, `element-patch.ts`, `element-summary.ts`). The MCP names still say "shapes" (`create_shapes`, …) so agents' setups keep working.
- **The app wires it up** in `app/mcp/` (`useAgentServer`, mounted by `<AgentServer />` in the providers). The open board registers itself for agents with `useAgentBoard` (`pages/editor/board/agent/`). The on/off setting is `stores/agent-server-store.ts`, and `pages/agent-server/` is the menu in both top bars that copies the URL and setup.

## React host (`src/pages/editor/board/`)

- `useCanvasEngine` creates and mounts the engine into a container div. The canvas theme is resolved from CSS tokens via `readCanvasTheme()`.
- The engine is provided through `EngineContext`. Chrome components use `useEngine()` and `useEngineState(selector)` (from `engine/engine-context.ts`), selecting primitives or stable references so each one re-renders only for its slice.
- **Never put canvas elements in React state.** React only hosts the canvas and draws the UI around it. The tool options panels (`components/tool-options/`) follow the active tool, or the selection's element type with the select tool.
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
