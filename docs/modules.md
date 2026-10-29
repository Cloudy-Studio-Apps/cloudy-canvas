# Modules

_The conventions every module follows (the rules are in [CLAUDE.md](../CLAUDE.md))._

## Words

| Word                         | Meaning                                                                                                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Engine**                   | `canvas/`, `shared/core`: plain TS systems that know no feature (document, scene, render, modes framework, effects pipeline, the variables engine `canvas/tokens`, the module API, the MCP protocol).                            |
| **Module**                   | The one unit of functionality: a folder with `<name>.module.ts`, `index.ts` and `README.md`. Core modules, features and plugins' modules are all modules, built the same way.                                                    |
| **Core module**              | A module the product can't exist without: it owns points others extend, its data is on every element, or other modules `require` it. Always loaded, may use the product's private internals.                                     |
| **Feature** (feature module) | Functionality the app defines and ships with, written **only against the public API** (what `PluginApi` exposes plus other modules' public entries). It could be moved out as a plugin with only its imports changed. Always on. |
| **Plugin**                   | Packaging, not a different kind of code: a folder installed from outside (`<appData>/plugins/`) with `plugin.json` whose `activate(api)` returns modules written exactly like features.                                          |
| **Agent**                    | _Who_ calls: an AI collaborator (presence, workspace, `AgentHost`, undo notes).                                                                                                                                                  |
| **MCP tool**                 | _What_ it calls: a tool on the MCP server (`.mcp.ts` files, `McpTool<H>`).                                                                                                                                                       |

**One structure, no special plugin API.** A feature and a plugin's module are written the same way: the
same `defineModule`, points, `.mcp.ts` shape and README. The plugin API _is_ the public surface features
may import, handed to plugins as `api` because their file can't `import`; `api` mirrors that surface one
to one, so moving a feature out (or a plugin in) only changes its import lines.

## Tiers

A module is **core** when at least one is true: (a) its data is on **every** element (`pageId`,
`sizing`, `bindings`); (b) it owns a point other modules must extend, or several modules `require` it;
(c) the product's other systems (opening files, the Figma/FigJam import, paste, the Layers tab) can't
work without it. Otherwise it's a **feature**. Every feature is always on; being one only decides _how
it's written_.

Each built-in module says its tier in `defineModule({ id, tier: "core" | "feature", … })`;
plugins' modules leave it unset. `scripts/check-modules.mjs` reads it.

### Design

| Module                                                                                                   | Tier    | Why                                                                               |
| -------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `core`                                                                                                   | Core    | node base, layer tree, paints and strokes, panels, the style types point and UI   |
| `pages`                                                                                                  | Core    | every node has `pageId`; the design's `scopes`                                    |
| `layers`                                                                                                 | Core    | the Layers tab (`layersTabSections`) and the tree-move rules                      |
| `frame`                                                                                                  | Core    | containers and clipping; auto layout, section, catalog and styleguide require it  |
| `group`                                                                                                  | Core    | child hosts; mask and sticker require it; the Figma import                        |
| `text`                                                                                                   | Core    | text styles, fonts, outlines; the Figma import                                    |
| `vector`                                                                                                 | Core    | booleans, Flatten, Outline stroke and the Figma import produce vectors            |
| `variables`                                                                                              | Core    | the variables engine, `bindings` on every node, the Styles section                |
| `effects`                                                                                                | Core    | `effects` on every node, the effects pipeline, the `designEffectTypes` point      |
| `auto-layout`                                                                                            | Core    | `sizing`, `layoutAbsolute`, `sizeLimits` on every node; relayout after every edit |
| `plugins-tab`                                                                                            | Core    | the plugin manager                                                                |
| `rectangle`, `ellipse`, `polygon`, `star`, `line`, `section`, `boolean`, `mask`, `image`                 | Feature | kinds, tools and commands built on the core; the Figma import makes them          |
| `sticker`, `shader-effect` (one effect type), `catalog` (a mode), `styleguide`, `assets`, `color-wizard` | Feature | built on the core and on each other                                               |

### Board

| Module                                                                | Tier    | Why                                                                    |
| --------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `core`                                                                | Core    | the select, hand and scale buttons, Hide UI, the tools for any element |
| `library`                                                             | Core    | owns the library points                                                |
| `connector`                                                           | Core    | `QuickConnectKind` (sticky and geo extend it), connector routing       |
| `text`, `image`                                                       | Core    | the fallbacks of `pasteText` and `pasteImage`; the FigJam import       |
| `sticky`, `geo`, `section`, `draw`, `table`, `embed`, `sticker`, `db` | Feature | kinds and tools built on the core                                      |
| `er` (a mode with its own points: standards and constructs)           | Feature | built on `db`, `connector`, `geo` and `section`                        |

### What a feature or a plugin can register (the same list)

| Can register                                         | Through                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| element types (kinds)                                | `canvas.kinds`                                                 |
| tools and keys, toolbar buttons                      | `canvas.tools`, `editor.tools`                                 |
| **modes**                                            | `canvas.modes`, `editor.modes`, `editor.modeSidebars`          |
| host commands, menus, context menu                   | `canvas.hostCommands`, `editor.mainMenu`, `editor.contextMenu` |
| panels, sections, left tabs, overlays, session hooks | `editor.*`                                                     |
| effect types                                         | `effects.effectTypes` and `canvas.effectRenderers`             |
| style types                                          | the core module's `designStyleTypes` point                     |
| Home's starters                                      | the core modules' `boardStarters` / `designStarters` points    |
| MCP tools                                            | `mcpTools`                                                     |
| file migrations                                      | `migrations`                                                   |
| stickers, themes, ER standards and constructs        | the app registries and the er module's points                  |
| canvas hooks (paste, `afterEdit`, `onRemove`, …)     | `canvas.*`                                                     |

## Module anatomy

```
modules/<name>/
  <name>.module.ts      REQUIRED  wiring only: defineModule + host.contribute. No logic.
                                  Past ~100 lines, split into the files below. Hands its public
                                  entries as `exports: { ...frameApi, ...frameUi }` (imported
                                  `* as` from "." and "./ui"), so a plugin gets them with
                                  host.require("frame").
  index.ts              REQUIRED  the module's public engine API (plain TS). What isn't exported
                                  here or in ui/index.ts is private.
  README.md             REQUIRED  what the feature is (see the README template).
  <name>.points.ts      if others extend it (a point lives in the module that reads it); a point
                        whose entries hold components is ui/<name>.points.ts, exported by ui/index.ts
  <name>.mode.ts        a mode the module adds: one defineDesignMode/defineBoardMode
  <name>.mcp.ts         MCP tools, one file …
  mcp/                  … or a folder: <topic>.mcp.ts + index.ts (+ helpers)
  <name>.canvas.ts      canvas hooks (kinds, tools, scene and tree hooks, copies): every board module
                        with any, so the HTML viewer can draw its elements without the editor UI
  <name>.commands.ts    host commands with their keys, when there are several
  <name>.sections.ts    editor entries (sections, panels, overlays, session hooks, toolbar buttons,
                        context menu), when there are many
  <name>.menu.ts        main menu groups, when there are many
  <name>.migration.ts   file migrations (or migrations/ with index.ts)
  <name>.i18n.ts       its translator, `export const t = defineMessages({ en, es })`, over
  locales/              en.json and es.json (src/shared/core/i18n/README.md)
  <name>-options.types.ts   tool options the module owns
  <type>.types.ts / .factory.ts / .kind.ts / .draw.ts / .defaults.ts / .tool.ts
  <sub-feature>/        families keep subfolders (er/entity, catalog/model, …), each with index.ts
  ui/                   React only; ui/index.ts is the module's public UI API
```

| Suffix                                                                    | Holds                                                                                     | React?             |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| `.module.ts`                                                              | `defineModule`                                                                            | imports UI, no JSX |
| `.points.ts`                                                              | `definePoint` tokens                                                                      | no (`ui/`: types)  |
| `.mode.ts`                                                                | a mode's whole definition                                                                 | imports UI         |
| `.mcp.ts`                                                                 | `McpTool`s / `McpToolGroup`                                                               | no                 |
| `.canvas.ts`                                                              | canvas hooks (a board module's every `boardCanvas` entry)                                 | no                 |
| `.commands.ts`                                                            | host command entries and keys                                                             | no                 |
| `.sections.ts`                                                            | editor entries (sections, panels, overlays, session hooks, toolbar buttons, context menu) | imports UI         |
| `.menu.ts`                                                                | main menu groups                                                                          | imports UI         |
| `.migration.ts`                                                           | document migrations                                                                       | no                 |
| `.kind.ts` `.tool.ts` `.draw.ts` `.factory.ts` `.defaults.ts` `.types.ts` | as in `src/canvas/elements/`                                                              | no                 |
| `.constants.ts`                                                           | ids, fixed values                                                                         | no                 |
| `ui/*.tsx`                                                                | components, hooks                                                                         | yes                |

Each split file exports `register<Module><Part>(host)` (e.g. `registerCoreCanvas`); `<name>.module.ts`
calls them. Nothing is found by its name: ESLint reads the suffix only to allow UI imports in
`.module.ts`, `.sections.ts`, `.menu.ts` and `.mode.ts`.

## Import rules

1. A module imports another module **only through its two public entries**: `index.ts` for engine
   code (`../frame`) and `ui/index.ts` for React (`../frame/ui`), never a file inside
   (`../frame/frame.kind`), and only if it's a **core module or in its `requires`/`uses`**. Core
   modules are always loaded, so importing one needs no `requires` (adding it would only change the
   load order). `uses` is for a feature it needs loaded when `requires` would make a loop with
   another module's `after` (er uses db and geo). Engine files may only use the other module's
   `index.ts`.
2. **Core modules never import features.** Features may import core modules and the features they
   `require` or `use`.
3. **Features use only the public surface**: `@canvas`, `@canvas-ui`, `@shared/core`, the kit, the
   product's barrels (`@design` and `@design/ui`, imported by the declaring file's path), other
   modules' public entries and the curated groups in `app/plugins/api/` (`ui`, `platform`). That's
   exactly what a plugin gets (`api` is those barrels), so if a feature needs more, it's exported
   from the barrel, never deep-imported.
4. Product-level code (`products/<p>/ui`, `mcp`, `file`, `figma`) imports modules only through
   `modules/index.ts` or a module's `index.ts` / `ui/index.ts`.
5. UI comes from `@shared/ui/kit`: the shadcn primitives and `cn` too (the kit re-exports them),
   never `@shared/ui/components/ui/…` or `@shared/ui/lib/utils` (rule `kit`). Before writing a
   field, toolbar or picker, look for it in the kit, `@canvas-ui` or a module's `ui/index.ts`.
6. `<product>-points.ts` holds only product-wide points (canvas points, MCP tools, migrations, select
   redirects). A feature's own points go in its `<name>.points.ts`.

**Checked by** `scripts/check-modules.mjs`, part of `pnpm lint` (`pnpm check:modules` alone): deep
imports (from modules and from anywhere else in `src/`), `requires`, core → feature, each module's
`index.ts`/`<name>.module.ts`/`README.md`/`tier`, MCP file names, module files over 120 lines, imports of the product barrel and of shadcn primitives or `cn` outside the kit, and modules that don't hand their `index.ts`/`ui/index.ts` as `exports` (rule `exports`).
`scripts/check-public-api.mjs`, also in `pnpm lint` (`pnpm check:public-api`), checks rule 3 with
the TypeScript API: every value a feature imports from outside its folder must be exported by the
barrel covering the file it comes from (rule `public`).
`node scripts/module-order.mjs` prints the order each product loads its modules in: compare it
before and after changing `requires`/`after`, since chained hooks run in that order. A module never imports its own product's barrel (`@design`, `@board`): it imports the file or module that declares the name (rule `barrel`).

## MCP files

- One file of tools: `modules/<name>/<name>.mcp.ts`, exporting the module's group.
- Two or more: `modules/<name>/mcp/<topic>.mcp.ts` and `mcp/index.ts`, which builds the module's
  group(s). Helpers only the tools use sit beside them without the suffix (`mcp/brochure-args.ts`).
- The module file imports only `./<name>.mcp` or `./mcp`, never a single tool file.
- **"Agent" is who calls, "MCP tool" is what it calls.** Files that define tools are `.mcp.ts`; files
  about the collaborator stay `agent-*.ts` (`agent-host.ts`, `agent-presence-source.ts`).
- MCP tool _names_ (`create_shapes`, `update_nodes`, …) are a separate plan; keep the existing ones.

## Modes

A mode is one definition, `defineDesignMode({…})` (`@design/ui/modules`) or `defineBoardMode({…})`
(`@board/ui/modules`), in the module's `<name>.mode.ts`, registered with one call,
`registerDesignMode(host, mode)` / `registerBoardMode(host, mode)` (plugins: `api.design.defineDesignMode`,
`api.design.registerDesignMode`, `api.board.defineBoardMode`, `api.board.registerBoardMode`). It fans out to the existing points through
`@canvas-ui`'s `registerEditorMode`. Catalog, the Design system and ER are written this way.

| Field                                                                        | What it does                                                                                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `tool`, `tools`, `allowTools`, `isolate`, `faded`, `commands`, `keybindings` | how the canvas behaves in it (`canvas.modes`, `canvas.tools`)                                                    |
| `label`, `description`, `icon`, `order`                                      | its button in the mode switcher                                                                                  |
| `toolbar`                                                                    | an item list or `{ useItems }` (items that depend on state), drawn by `ModeToolbar`, or `{ component }`          |
| `hostCommands`                                                               | its commands; `run(engine)` handles one (left out when a hook needs React context to)                            |
| `overlays`                                                                   | DOM over the canvas, mounted only while it's on                                                                  |
| `onEnter`/`onLeave`, `hooks`                                                 | work on switching in or out; session hooks for as long as the editor is open                                     |
| `rail.tabs`, `rail.keep` (design)                                            | **only** these left tabs while it's on, plus the default tabs it keeps                                           |
| `sidebar` (design)                                                           | the properties panel while it's on: a component, or `{ component, keepSections }` to keep some sections under it |

**The rail rule** (`tabsForMode`): in the default mode the rail shows every tab without `modes`; in any
other mode it shows only the mode's `rail.tabs` plus `rail.keep`. The rail's fixed buttons (main menu,
agents, panel toggle) always stay.

## Reusable pieces

Export a piece once, where what it knows lives, and reuse it instead of writing another:

| Knows                                                       | Lives in                   | Import (feature)                  | Plugin                 |
| ----------------------------------------------------------- | -------------------------- | --------------------------------- | ---------------------- |
| nothing but the theme (fields, selects, cards)              | `@shared/ui/kit`           | `@shared/ui/kit`                  | `api.ui.kit`           |
| the canvas engine (colors, images, thumbnails, mode chrome) | `@canvas-ui`               | `@canvas-ui`                      | `api.canvasUi`         |
| the product (paints, bindings, node fields, modes)          | `@design/ui` / `@board/ui` | `@design/ui/<path>`               | `api.design`           |
| one module (font picker, frame presets, layer names)        | the module's `ui/index.ts` | `../text/ui` (only if `requires`) | `host.require("text")` |

A feature imports the product's pieces by their path (`@design/ui/components/panel`), since
importing `@design/ui` from a module would loop through the module list; `@design/ui` exports them
all, and `check-public-api` keeps the two in step.

## README template

Every module's `README.md` (and every folder whose behavior needs explaining) says what it is, next to
the code. When you change how something works, update its README in the same change.

```md
# <name>

<One paragraph: what the feature is, as the user sees it.>

- **Tier:** core | feature
- **Requires:** core, pages (and `uses`/`after` when it has them)
- **Contributes:** kinds `x`; tool `x` (X); sections …; host commands …; hooks …
- **Points it owns:** `xTypes` (who extends it)
- **MCP tools:** `a_b`, `c_d`
- **Files:** the important ones and what they hold
- **Not yet:** …
```

Then `## How it works`: the details (types, hooks, edge cases, how to extend it). Add `Not yet`
only when something is known to be missing.
