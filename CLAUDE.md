# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cloudy Canvas (by DarkRedgm) is a desktop-first Figma + FigJam app built with Tauri 2, React 19, Vite, TypeScript (strict, `noUncheckedIndexedAccess`), Tailwind v4, shadcn/ui (Radix), Zustand and React Router. One app holds two **products** on one shared canvas engine: **Board** (`.cboard`, FigJam-style; the editor is at `/board/:id` and is being rebuilt on the element architecture, see Elements) and **Design** (`.cdesign`, Figma-style; the editor is at `/design/:id`, built on modules from the start: frames and rectangles in a layer tree so far, see Design). Roadmap: desktop with local files, then a web build of the same frontend, then real-time collaboration (Yjs + Hocuspocus, Laravel backend). It must build on Windows 11 and Arch Linux, and on macOS (built on a Mac or in CI, never cross-built).

## Commands

```sh
pnpm install
pnpm tauri dev      # desktop app
pnpm dev            # frontend only in a browser (native dialogs unavailable)
pnpm lint           # ESLint (flat config, eslint.config.js)
pnpm typecheck      # tsc for app + vite config (noEmit)
pnpm format         # Prettier (with tailwind plugin); format:check to verify
pnpm tauri build    # production bundle
pnpm release:linux  # AppImage (src-tauri/target/release/bundle/appimage/)
pnpm release:arch   # pacman package (packaging/arch/PKGBUILD, needs makepkg):
                    # packaging/arch/cloudy-canvas-<ver>-1-x86_64.pkg.tar.zst, with the
                    # desktop entry, icons and the .cboard/.cdesign mime types
pnpm release:win    # Windows installer cross-built from Linux (cargo-xwin, NSIS):
                    # src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
pnpm release        # both
pnpm release:win:native  # on Windows itself: NSIS and MSI installers
pnpm release:mac    # on macOS itself: a universal .app and .dmg (both Rust darwin targets),
                    # src-tauri/target/universal-apple-darwin/release/bundle/
pnpm release:tag 0.2.0   # bump the version, commit, tag v0.2.0 and push: CI builds a draft release
```

There is no test framework. **Verification is `pnpm lint` and `pnpm typecheck` only** (plus `pnpm format:check`). Do not run `tauri dev`, cargo, builds or browser checks to verify changes unless asked.

`VITE_MOCK_RECENTS=true` in `.env.local` (see `.env.example`) fills the Home "Recent files" grid with mock data in dev builds. `/design-system` is a dev-only page that previews tokens and components.

## Rules

These are the rules. How things work is described in the `README.md` next to the code (see Where to
look); the module conventions are in [docs/modules.md](docs/modules.md).

**Before you change code**

1. Read the `README.md` of the folder you change and of its parents up to `src/`. When you change how
   something works, update that README in the same change; a new folder whose behavior needs
   explaining gets one.
2. Verify with `pnpm lint`, `pnpm typecheck` and `pnpm format:check` only. There is no test framework.
   Don't run `tauri dev`, cargo, builds or browser checks unless asked.

**Layering** (enforced by ESLint `no-restricted-imports`)

3. Path aliases: `@app/*`, `@pages/*`, `@platform`, `@shared/*` (`@shared/core`, `@shared/ui/…`,
   `@shared/stores/…`, `@shared/agent-server`), `@canvas`, `@canvas-ui`, `@board`, `@design`
   (`@board/ui`, `@design/ui` for the editors). They're defined in both `tsconfig.json` and
   `vite.config.ts`: keep the two in sync (`components.json` uses them too).
4. Engine code is plain TypeScript, so the web build can reuse it: `shared/core`, `canvas/` and
   `products/*` outside their UI (`ui/`, `modules/*/ui/`, `modules/*/*.module.ts`) never import a
   product's UI, React, UI layers (`@shared/ui`, `@shared/stores`, `@canvas-ui`, `@pages`, `@app`) or
   platform code (`@platform`, `@tauri-apps/*`).
5. Lower layers never know higher ones: `shared/` doesn't import `@canvas`/`@canvas-ui`; `shared/`,
   `canvas/` and `canvas-ui/` don't import products. Products never import each other.
6. A product's `ui/` uses its own engine side through its barrel (`@board`), plus `@canvas`,
   `@canvas-ui` and `@shared/*`.
7. Platform access goes through interfaces in `shared/core` (e.g. `Storage`), implemented in
   `platform/`. Business logic lives in TypeScript, not Rust: `src-tauri/` only registers plugins,
   holds config and capabilities, and carries transports (see its READMEs).
8. Ids come from `createId()` (`crypto.randomUUID()`), never auto-increment. Zustand stores
   (`shared/stores/`) hold app UI state only, never canvas content.

**Engine**

9. Registries are per product, never global: anything that needs an element's kind gets the product's
   `ElementKinds` and calls `kinds.kindOf(el)`.
10. Content lives only in the Yjs doc. Every edit goes through `CanvasDocument` (`add`, `update`,
    `updateMany`, `remove`); call `doc.checkpoint()` before a user action. Never mutate an element read
    from the document.
11. Elements are plain data; behavior lives in kind classes. Never branch on `el.type` outside an
    element's folder: ask its kind. Shared behavior goes in a base (`canvas/elements/bases/`).
12. Read geometry from the scene (`engine.getElement`, `ctx.getElement`), not from `doc.get`.
13. A product's `keybindings` are the single source of shortcuts; the UI reads labels with
    `engine.keymap.label(command)`. Never hard-code shortcut strings.
14. Never put canvas elements in React state. React only hosts the canvas and draws the UI around it.
15. Tools act only through `ToolContext`, never through the engine directly.

**Modules** ([docs/modules.md](docs/modules.md))

16. New functionality is a module: one folder in its product's `modules/` with `<name>.module.ts`,
    `index.ts` and `README.md`. Its tier (core or feature) is in [Tiers](docs/modules.md#tiers), its
    files in [Module anatomy](docs/modules.md#module-anatomy).
17. Follow the [import rules](docs/modules.md#import-rules): other modules only through their
    `index.ts` / `ui/index.ts` and only if they're in `requires`; core never imports features.
18. A feature uses only what a plugin could. When it needs something private, make it public (and
    give it to `PluginApi`) instead of deep-importing it.
19. A point lives in the module that reads it (`<name>.points.ts`).

**MCP**

20. "Agent" is who calls, "MCP tool" is what it calls. MCP tools live in `.mcp.ts` files (see
    [MCP files](docs/modules.md#mcp-files)). Every editing tool wraps its writes in one `asUndoStep`
    and validates everything before writing.

**Code**

21. Small, single-purpose files: one component, tool, layer or helper per file, re-exported through a
    folder `index.ts`. Split a file once it mixes concerns or grows past ~200 lines.
22. Reuse before writing: `canvas/utils` (`Store`, `Emitter`, `Disposables`, `FrameScheduler`,
    `Registry`, `debounce`, `clamp`/`mod`), `canvas/geometry.ts`, `canvas/tools/drag-threshold.ts`
    (`pastThreshold`, `MOVE_THRESHOLD_PX`, `DRAW_THRESHOLD_PX`), `shared/core/keyboard.ts`,
    `shared/ui/layout` (`AppHeader`, `PageContainer`), `shared/ui/hooks`, `canvas-ui` for editor
    chrome.
23. Text fields that commit on Enter/blur and revert on Escape use `useCommitField` +
    `commitFieldProps(field)`, never hand-written key handlers.
24. Use `@shared/ui/kit` before writing a component. ESLint warns on a raw `<button>`/`<input>`
    outside the kit; a one-off says why with
    `eslint-disable-next-line no-restricted-syntax -- bespoke: <why>`.
25. Every `interface` and `type`, including component props, goes in a sibling `<file>.types.ts`,
    imported with `import type` and re-exported by barrels with `export type`. Vendored shadcn
    primitives in `src/shared/ui/components/ui/` are exempt.

**UI**

26. Components use semantic tokens only (`bg-surface`, `text-muted-foreground`, `bg-primary`, …), never
    hard-coded colors or the palette scales (`ice`, `seal`, `blush`, `sand`, `lilac`).
27. Sharp shapes: radii are 4px for controls (`rounded-md`), 6px for cards and menus
    (`rounded-card`/`rounded-lg`), 8px at most. No pills.
28. Every color is picked with the one picker (`ColorPicker`, `ColorPalette`, `canvas-ui`).
29. Report failures with `notifyError(title, error)` or `toast(…)`, never only `console.error`.

## Transition

The rules above describe where the code is going (spec:
[module conventions](docs/superpowers/specs/2026-10-25-module-conventions-design.md)). **Until a row's
phase is done, follow the existing pattern in that part of the code.**

| Rule                                                                             | Code today                                                                      | Fixed in phase |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------- |
| MCP tools in `.mcp.ts` / `mcp/`; `canvas/mcp`, `products/*/mcp`; `McpTool` names | `*.agent-tools.ts`, `*.agent-tool.ts`, `agent/` folders, `AgentTool`            | 2              |
| a feature's points in its `<name>.points.ts`; styles UI in variables             | some in `board-points.ts`, `design/ui/modules/`, `design/ui/components/styles/` | 3              |
| `<name>.module.ts` ≤ ~100 lines, wiring only                                     | design `core` (~380 lines), `er`                                                | 4              |
| import rules enforced; every module has a complete `README.md`                   | deep imports between modules; READMEs only where descriptions moved             | 5              |
| shared pieces (`ColorField`, `chooseImageAsset`, `ModeToolbar`, …)               | duplicated per feature                                                          | 5a             |
| one mode definition (`defineDesignMode`, `registerMode`)                         | about 10 contributions per mode                                                 | 5b             |
| plugin API as the barrels, `host.require`, module `exports`                      | a hand-kept list in `app/plugins/create-plugin-api.ts`                          | 6              |

## Where to look

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
    board/      engine side: its points, palette, shared agent tools, file format
      modules/  one folder per feature (its element types, tools, agent tools + `ui/` +
                `<name>.module.ts`), see Modules
      ui/       the board editor (React); composes the product from the modules
    design/     engine side: its points, file format and modules (core: the node base and the
                layer tree; frame, rectangle, layers, assets, plugins-tab)
      ui/       the design editor (React): rail, left panel, properties panel, toolbar
  pages/        app pages that aren't a product: home, settings, join, design-system
server/relay/   the live sessions' relay (iroh-relay config, Docker, deploy script, guide)
```

Each folder below explains itself in its `README.md`. The main ones:

| Topic                                                                                | README                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The canvas engine (document, scene, tools, modes, render, export, rotation, …)       | [src/canvas/](src/canvas/README.md) and its folders (`document/`, `tools/`, `render/`, …)                                                                                |
| Elements and kinds                                                                   | [src/canvas/elements/](src/canvas/elements/README.md)                                                                                                                    |
| Variables (engine)                                                                   | [src/canvas/tokens/](src/canvas/tokens/README.md)                                                                                                                        |
| Shared editor pieces (hosting, color picker, files, module chrome, live sessions UI) | [src/canvas-ui/](src/canvas-ui/README.md) and its folders                                                                                                                |
| The module API                                                                       | [src/shared/core/modules/](src/shared/core/modules/README.md)                                                                                                            |
| Plugins (loading, `api`, stickers, themes)                                           | [src/app/plugins/](src/app/plugins/README.md), [docs/plugins.md](docs/plugins.md)                                                                                        |
| The agent (MCP) server                                                               | [src/app/mcp/](src/app/mcp/README.md)                                                                                                                                    |
| Collaborators, workspaces, live sessions                                             | [src/shared/core/presence/](src/shared/core/presence/README.md), [src/canvas/workspace/](src/canvas/workspace/README.md), [docs/collaboration.md](docs/collaboration.md) |
| The board and its modules                                                            | [src/products/board/](src/products/board/README.md), `src/products/board/modules/*/`                                                                                     |
| The design and its modules                                                           | [src/products/design/](src/products/design/README.md), `src/products/design/modules/*/`                                                                                  |
| Design system, themes, kit                                                           | [src/shared/ui/](src/shared/ui/README.md), [src/shared/ui/kit/](src/shared/ui/kit/README.md)                                                                             |
| Module conventions and tiers                                                         | [docs/modules.md](docs/modules.md)                                                                                                                                       |
| ER language                                                                          | [docs/er-language.md](docs/er-language.md)                                                                                                                               |
| Performance work parked for later                                                    | [docs/performance-roadmap.md](docs/performance-roadmap.md)                                                                                                               |
