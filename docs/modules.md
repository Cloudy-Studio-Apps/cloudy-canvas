# Modules

_The conventions every module follows. Where the code doesn't yet, see the Transition table in
[CLAUDE.md](../CLAUDE.md). Background and the reasoning:
[the module conventions spec](superpowers/specs/2026-10-25-module-conventions-design.md)._

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

### Design

| Module                                                                                   | Tier    | Why                                                                               |
| ---------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `core`                                                                                   | Core    | node base, layer tree, paints and strokes, select/scale/hand, panels              |
| `pages`                                                                                  | Core    | every node has `pageId`; the design's `scopes`                                    |
| `layers`                                                                                 | Core    | the Layers tab and the tree-move rules                                            |
| `frame`                                                                                  | Core    | containers and clipping; auto layout, section, catalog and styleguide require it  |
| `group`                                                                                  | Core    | child hosts; mask and sticker require it; the Figma import                        |
| `text`                                                                                   | Core    | text styles, fonts, outlines; the Figma import                                    |
| `vector`                                                                                 | Core    | booleans, Flatten, Outline stroke and the Figma import produce vectors            |
| `variables`                                                                              | Core    | the variables engine, `bindings` on every node, the style types point             |
| `effects`                                                                                | Core    | `effects` on every node, the effects pipeline, the `effectTypes` point            |
| `auto-layout`                                                                            | Core    | `sizing`, `layoutAbsolute`, `sizeLimits` on every node; relayout after every edit |
| `plugins-tab`                                                                            | Core    | the plugin manager                                                                |
| `rectangle`, `ellipse`, `polygon`, `star`, `line`, `section`, `boolean`, `mask`, `image` | Feature | kinds, tools and commands built on the core; the Figma import makes them          |
| `sticker`, `shader-effect` (one effect type), `catalog` (a mode), `styleguide`, `assets` | Feature | built on the core and on each other                                               |

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
| effect types                                         | `effectTypes` and `canvas.effectRenderers`                     |
| style types                                          | the variables module's style types point                       |
| MCP tools                                            | `mcpTools`                                                     |
| file migrations                                      | `migrations`                                                   |
| stickers, themes, ER standards and constructs        | the app registries and the er module's points                  |
| canvas hooks (paste, `afterEdit`, `onRemove`, …)     | `canvas.*`                                                     |

## Module anatomy

```
modules/<name>/
  <name>.module.ts      REQUIRED  wiring only: defineModule + host.contribute. No logic.
                                  Past ~100 lines, split into the files below.
  index.ts              REQUIRED  the module's public engine API (plain TS). What isn't exported
                                  here or in ui/index.ts is private.
  README.md             REQUIRED  what the feature is (see the README template).
  <name>.points.ts      if others extend it (a point lives in the module that reads it)
  <name>.mode.ts        a mode the module adds: one defineDesignMode/defineBoardMode
  <name>.mcp.ts         MCP tools, one file …
  mcp/                  … or a folder: <topic>.mcp.ts + index.ts (+ helpers)
  <name>.commands.ts    host commands with their keys, when there are several
  <name>.sections.ts    property-panel / main-menu / context-menu entries, when there are many
  <name>.migration.ts   file migrations (or migrations/ with index.ts)
  <name>-options.types.ts   tool options the module owns
  <type>.types.ts / .factory.ts / .kind.ts / .draw.ts / .defaults.ts / .tool.ts
  <sub-feature>/        families keep subfolders (er/entity, catalog/model, …), each with index.ts
  ui/                   React only; ui/index.ts is the module's public UI API
```

| Suffix                                                                    | Holds                            | React?             |
| ------------------------------------------------------------------------- | -------------------------------- | ------------------ |
| `.module.ts`                                                              | `defineModule`                   | imports UI, no JSX |
| `.points.ts`                                                              | `definePoint` tokens             | no                 |
| `.mode.ts`                                                                | a mode's whole definition        | imports UI         |
| `.mcp.ts`                                                                 | `McpTool`s / `McpToolGroup`      | no                 |
| `.commands.ts`                                                            | host command entries and keys    | no                 |
| `.sections.ts`                                                            | editor entries (sections, menus) | imports UI         |
| `.migration.ts`                                                           | document migrations              | no                 |
| `.kind.ts` `.tool.ts` `.draw.ts` `.factory.ts` `.defaults.ts` `.types.ts` | as in `src/canvas/elements/`     | no                 |
| `.constants.ts`                                                           | ids, fixed values                | no                 |
| `ui/*.tsx`                                                                | components, hooks                | yes                |

## Import rules

1. A module imports another module **only through its two public entries**: `index.ts` for engine
   code (`../frame`) and `ui/index.ts` for React (`../frame/ui`), never a file inside
   (`../frame/frame.kind`), and only if that module is in its `requires`. Engine files may only use the
   other module's `index.ts`.
2. **Core modules never import features.** Features may import core modules and the features they
   `require`.
3. **Features use only the public surface**: `@canvas`, `@canvas-ui`, `@shared/*`, the product's
   barrel and points, and other modules' public entries. If they need more, it's added to the public
   surface **and to `PluginApi` at the same time**, never deep-imported.
4. Product-level code (`products/<p>/ui`, `mcp`, `file`, `figma`) imports modules only through
   `modules/index.ts` or a module's `index.ts` / `ui/index.ts`.
5. `<product>-points.ts` holds only product-wide points (canvas points, MCP tools, migrations, select
   redirects). A feature's own points go in its `<name>.points.ts`.

## MCP files

- One file of tools: `modules/<name>/<name>.mcp.ts`, exporting the module's group.
- Two or more: `modules/<name>/mcp/<topic>.mcp.ts` and `mcp/index.ts`, which builds the module's
  group(s). Helpers only the tools use sit beside them without the suffix (`mcp/brochure-args.ts`).
- The module file imports only `./<name>.mcp` or `./mcp`, never a single tool file.
- **"Agent" is who calls, "MCP tool" is what it calls.** Files that define tools are `.mcp.ts`; files
  about the collaborator stay `agent-*.ts` (`agent-host.ts`, `agent-presence-source.ts`).
- MCP tool _names_ (`create_shapes`, `update_nodes`, …) are a separate plan; keep the existing ones.

## Modes

A mode is described by one definition (`defineDesignMode` / `defineBoardMode`, arriving in phase 5b of
the spec) registered with one call, `registerMode(host, mode)`, which fans out to the existing points.

| Field                                                                         | What it does                                                                           |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `tool`, `tools`, `allowTools`, `isolate`, `faded`, `commands`, `keybindings`  | how the canvas behaves in it (`canvas.modes`, `canvas.tools`)                          |
| `label`, `description`, `icon`, `order`                                       | its button in the mode switcher                                                        |
| `toolbar`                                                                     | items (tools, commands, custom `run`, dividers) drawn by `ModeToolbar`, or a component |
| `rail.tabs`, `rail.keep`                                                      | **only** these left tabs while it's on (one is fine), plus kept ones                   |
| `sidebar`                                                                     | the properties panel: a component, optionally keeping some sections                    |
| `overlays`, `hostCommands` (with `run`), `onEnter`/`onLeave`, `hooks`, `menu` | the rest of its UI and behavior                                                        |

**The rail rule:** in the default mode the rail shows every tab without `modes`; in any other mode it
shows only the mode's `rail.tabs` plus `rail.keep`. The rail's fixed buttons (main menu, agents, panel
toggle) always stay.

## Reusable pieces

Export a piece once, where what it knows lives, and reuse it instead of writing another:

| Knows                                                       | Lives in                   | Import (feature)                  | Plugin                    |
| ----------------------------------------------------------- | -------------------------- | --------------------------------- | ------------------------- |
| nothing but the theme (fields, selects, cards)              | `@shared/ui/kit`           | `@shared/ui/kit`                  | `api.ui.kit`              |
| the canvas engine (colors, images, thumbnails, mode chrome) | `@canvas-ui`               | `@canvas-ui`                      | `api.canvasUi`            |
| the product (paints, bindings, node fields, modes)          | `@design/ui` / `@board/ui` | `@design/ui`                      | `api.design`              |
| one module (font picker, frame presets, layer names)        | the module's `ui/index.ts` | `../text/ui` (only if `requires`) | `host.require("text").ui` |

## README template

Every module's `README.md` (and every folder whose behavior needs explaining) says what it is, next to
the code. When you change how something works, update its README in the same change.

```md
# <name>

<One paragraph: what the feature is, as the user sees it.>

- **Tier:** core | feature
- **Requires:** core, pages
- **Contributes:** kinds `x`; tool `x` (X); sections …; host commands …; hooks …
- **Points it owns:** `xTypes` (who extends it)
- **MCP tools:** `a_b`, `c_d`
- **Files:** the important ones and what they hold
- **Not yet:** …
```
