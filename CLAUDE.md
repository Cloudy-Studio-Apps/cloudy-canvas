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
- Business logic lives in TypeScript, not Rust. `src-tauri/` only registers plugins (currently `tauri_plugin_dialog`) and holds window config/capabilities.
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
- **Database tables** (`db/`, the `db` tool): each table is a `db-table` shape whose `columns` are a plain JSON array. A relation lives on the source column (`column.ref`) and points at the target by table/column **id**, so moves and renames never break it. All tables together form the board's single schema.
  - `DbSchema` (`engine.db`) is the only place that edits tables. It covers visual edits, `applyTableDbml` (one table's slice), `applySchemaDbml` (the whole schema) and `importSchemaDbml` (merge).
  - DBML is a generated view (`db/dbml/`: a hand-written parser and serializer for a subset). Parsed text goes through `reconcile.ts`, which matches tables and columns by name, then by position for renames, so ids survive.
  - Relations are resolved in `Scene` and drawn by `render/layers/relation-layer.ts` under the shapes. New relations are dragged from column handles by `tools/connect-gesture.ts`, with `input/edge-auto-pan.ts` panning when the pointer nears the edge.
- **UI state** is exposed as an immutable `EngineState` snapshot (`utils/store.ts`, shallow-compared), via `engine.subscribe` / `engine.getState`.

## React host (`src/pages/editor/board/`)

- `useCanvasEngine` creates and mounts the engine into a container div. The canvas theme is resolved from CSS tokens via `readCanvasTheme()`.
- The engine is provided through `EngineContext`. Chrome components use `useEngine()` and `useEngineState(selector)` (from `engine/engine-context.ts`), selecting primitives or stable references so each one re-renders only for its slice.
- **Never put canvas shapes in React state.** React only hosts the canvas and draws the UI around it. The DB side panel (`components/db-panel/`) reads tables through `useDbQuery` / `useDbTable` (read-through caches keyed on `engine.db.getVersion()`).
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
