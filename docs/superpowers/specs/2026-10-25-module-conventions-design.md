# Module conventions: core modules, features and MCP files

Status: **proposal, nothing changed yet**. Date: 2026-10-25.

This defines how every module folder is built, named and registered, which modules are **core**
(always there, others build on them) and which are **features** (the functionality the app ships
with, written against the same public API a plugin uses), and renames the agent tool files to
`.mcp.ts`. It ends with a migration plan in phases.

---

## 1. Why

- **The rules get lost.** `CLAUDE.md` is **208 KB**. Nearly all of it describes features; the actual
  rules (layering, file naming, kit first, `.types.ts`, verification) are a few sentences in the
  middle. An agent reading it can't tell a rule from a description, so it doesn't follow them.
- **Agent tools have four shapes** (`x.agent-tools.ts`, `x.agent-tool.ts`, an `agent/` folder in a
  module, and the board's tools outside any module in `products/board/agent/`).
- **Features live outside their folder** (styles UI in `design/ui/components/styles`, the
  `designStyleTypes` point in `design/ui/modules/style-types.ts`, `define-effect-type.ts` in
  `design/ui/modules`, the ER points in `board-points.ts`).
- **Modules reach into each other's private files** and nothing checks it (list in §8).
- There's no line between "core" and "a feature that could be a plugin", so everything ends up
  treated as core.

---

## 2. Vocabulary

| Word                         | Meaning                                                                                                                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Engine**                   | `canvas/`, `shared/core`: plain TS systems that know no feature (document, scene, render, modes framework, effects pipeline, variables engine `canvas/tokens`, module API, MCP protocol).                                                 |
| **Module**                   | The one unit of functionality: a folder with `<name>.module.ts`, `index.ts`, `README.md` (§4). Core modules, features and plugins' modules are all modules, built the same way.                                                           |
| **Core module**              | A module the product can't exist without: it owns points others extend, its data is on every element, or other modules `require` it. Always loaded, can't be turned off, may use the product's private internals.                         |
| **Feature** (feature module) | Functionality the app defines and ships with, written **only against the public API** (what `PluginApi` exposes plus other modules' `index.ts`). It _could_ be moved out as a plugin with only its imports changed. Always on, like core. |
| **Plugin**                   | _Packaging_, not a different kind of code: a folder installed from outside (`<appData>/plugins/`) with `plugin.json` whose `activate(api)` returns modules written exactly like features. Third-party or the user's own.                  |
| **Agent**                    | _Who_ calls: an AI collaborator (presence, workspace, `AgentHost`, undo notes).                                                                                                                                                           |
| **MCP tool**                 | _What_ it calls: a tool on the MCP server (`.mcp.ts` files, `McpTool<H>`).                                                                                                                                                                |

**One structure, no special plugin API.** A feature and a plugin's module are written the same way:
same `defineModule`, same points, same `.mcp.ts` shape, same README. The plugin API _is_ the public
surface features are allowed to import (rule 3 in §4), handed to plugins as `api` because their file
can't `import`; `api` mirrors that surface one to one, so moving a feature out (or adopting a plugin
in) only changes import lines. In the UI, features are listed as the app's features, plugins under
Settings › Plugins.

**Rule of thumb:** "agent" is the actor, "MCP" is the protocol surface. A file that defines tools is
`.mcp.ts`; a file about the collaborator stays `agent-*.ts` (`agent-host.ts`,
`agent-presence-source.ts`).

---

## 3. Decisions

### 3.1 "Agent tool" or "MCP tool"? → **MCP tool**

The tool exists because of the protocol (it has an `inputSchema`, is listed by `tools/list`, is called
by `tools/call`). "Agent" already means the collaborator everywhere else (presence, workspaces,
following). Mixing the two is why names drifted. So:

| Before                                                                                     | After                                                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `canvas/agent/agent-tool.types.ts` `AgentTool<H>`                                          | `canvas/mcp/mcp-tool.types.ts` `McpTool<H>`                                                 |
| `AgentToolGroup<H, C>`                                                                     | `McpToolGroup<H, C>`                                                                        |
| `shared/core/mcp` `McpTool` (protocol level, no host)                                      | `McpServerTool` (only `app/mcp` and `shared/core/mcp` use it)                               |
| `BoardAgentTool`, `BoardAgentToolGroup`                                                    | `BoardMcpTool`, `BoardMcpToolGroup`                                                         |
| `DesignAgentTool`, `DesignAgentToolGroup`                                                  | `DesignMcpTool`, `DesignMcpToolGroup`                                                       |
| point `boardAgentTools` / `designAgentTools`                                               | `boardMcpTools` / `designMcpTools`                                                          |
| `api.board.agentTools`, `api.design.agentTools`                                            | `api.board.mcpTools`, `api.design.mcpTools` (no aliases: the plugin API is redesigned, §14) |
| `canvas/agent/` (helpers: `agentPatches`, `buildElement`, `asUndoStep`, `arrangeTools`, …) | `canvas/mcp/` (same helpers; `asUndoStep` etc. keep their names)                            |
| `products/*/agent/` (plumbing: host, instructions, `create*AgentTools`)                    | `products/*/mcp/`                                                                           |
| `AgentHost`, `DesignAgentHost`                                                             | **unchanged** (it's what the agent reaches)                                                 |
| `AGENT_INSTRUCTIONS`                                                                       | `MCP_INSTRUCTIONS` (they're the server's instructions)                                      |

The MCP tool _names_ agents see (`create_shapes`, `update_nodes`, …) **don't change**, so agents'
setups keep working.

### 3.2 One `.mcp.ts` or a folder?

- **One file** → `modules/<name>/<name>.mcp.ts`, exporting the module's group (`frameMcp`).
- **Two files or more** → `modules/<name>/mcp/<topic>.mcp.ts` + `mcp/index.ts` that builds the
  module's group(s). Helpers used only by the tools sit beside them without the suffix
  (`mcp/brochure-args.ts`, `mcp/describe-brochure.ts`).
- The module file imports **only** `./<name>.mcp` or `./mcp`, never a single tool file.
- Never `.agent-tool.ts`, never a singular/plural split: one file = one _topic_, any number of tools.

It's worth it: the big modules (core: 9 files, variables: 8, catalog: 4) each have args/describe
helpers that belong next to their tools, and the `mcp/index.ts` is the one place that says which
groups the module registers.

### 3.3 Module README → **yes**

Each module gets `README.md`: what the feature is, what it contributes, what it requires, its MCP
tools, what's not done yet. The feature prose now in `CLAUDE.md` moves there (see §10).

---

## 4. Module anatomy (the rules)

```
modules/<name>/
  <name>.module.ts      REQUIRED  wiring only: defineModule + host.contribute. No logic.
                                  Past ~100 lines, split into the files below.
  index.ts              REQUIRED  the module's public engine API (plain TS). What isn't exported
                                  here or in ui/index.ts is private.
  README.md             REQUIRED  what the feature is (see §3.3).
  <name>.points.ts      if others extend it (a point lives in the module that reads it)
  <name>.mode.ts        a mode the module adds: one defineDesignMode/defineBoardMode (§15)
  <name>.mcp.ts         MCP tools, one file …
  mcp/                  … or a folder: <topic>.mcp.ts + index.ts (+ helpers)
  <name>.canvas.ts      canvas hooks (kinds, tools, scene and tree hooks, copies), when there are several
  <name>.commands.ts    host commands with their keys, when there are several
  <name>.sections.ts    editor entries (sections, panels, overlays, session hooks, toolbar buttons,
                        context menu), when there are many
  <name>.menu.ts        main menu groups, when there are many
  <name>.migration.ts   file migrations (or migrations/ with index.ts)
  <name>-options.types.ts   tool options the module owns
  <type>.types.ts / .factory.ts / .kind.ts / .draw.ts / .defaults.ts / .tool.ts   (as today)
  <sub-feature>/        families keep subfolders (er/entity, catalog/model, …), each with index.ts
  ui/                   React only; ui/index.ts is the module's public UI API (§16.1)
```

### File suffixes

| Suffix                                                                    | Holds                                                                                     | React?             |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| `.module.ts`                                                              | `defineModule`                                                                            | imports UI, no JSX |
| `.points.ts`                                                              | `definePoint` tokens                                                                      | no                 |
| `.mode.ts`                                                                | a mode's whole definition (§15)                                                           | imports UI         |
| `.mcp.ts`                                                                 | `McpTool`s / `McpToolGroup`                                                               | no                 |
| `.canvas.ts`                                                              | canvas hooks                                                                              | no                 |
| `.commands.ts`                                                            | host command entries + keys                                                               | no                 |
| `.sections.ts`                                                            | editor entries (sections, panels, overlays, session hooks, toolbar buttons, context menu) | imports UI         |
| `.menu.ts`                                                                | main menu groups                                                                          | imports UI         |
| `.migration.ts`                                                           | document migrations                                                                       | no                 |
| `.kind.ts` `.tool.ts` `.draw.ts` `.factory.ts` `.defaults.ts` `.types.ts` | as today                                                                                  | no                 |
| `.constants.ts`                                                           | ids, fixed values                                                                         | no                 |
| `ui/*.tsx`                                                                | components, hooks                                                                         | yes                |

### Import rules

1. A module imports another module **only through its two public entries**: `index.ts` for engine
   code (`../frame`) and `ui/index.ts` for React (`../frame/ui`), never a file inside
   (`../frame/frame.kind`), and only if it's a core module or in its `requires`/`uses` (changed in
   phase 5: core modules are always loaded, and requiring one would only reorder modules; `uses` =
   must be loaded, in any order). Engine files may only use the other module's `index.ts`.
2. **Core modules never import features.** Features may import core modules and the features they
   `require`.
3. **Features use only the public surface**: `@canvas`, `@canvas-ui`, `@shared/*`, the product's
   barrel/points, and other modules' `index.ts`. If they need more, that thing is added to the public
   surface **and to `PluginApi` at the same time**, never deep-imported. This is what keeps features
   and plugins the same: there is no separate plugin API to maintain.
4. Product-level code (`products/<p>/ui`, `mcp`, `file`, `figma`) imports modules only through
   `modules/index.ts` or a module's `index.ts` / `ui/index.ts`.
5. `<product>-points.ts` holds only product-wide points (canvas points, MCP tools, migrations,
   select redirects). A feature's own points go in its `<name>.points.ts`.

All five are checked (§11), not just written.

---

## 5. Which modules are core, which are features

How to decide: a module is **core** when at least one is true:

- (a) its data is on **every** element (e.g. `pageId`, `sizing`, `bindings`);
- (b) it owns a point other modules **must** extend, or several modules `require` it;
- (c) the product's other systems (file opening, Figma/FigJam import, paste, the Layers tab) can't
  work without it.

Otherwise it's a **feature**. Features are system functionality: **all of them are always on**, there
is no switch to turn one off. Being a feature only changes _how it's written_ (against the public
API, §14), so a custom plugin can do the same things the same way.

### 5.1 Design (27 modules)

| Module          | Tier           | Why                                                                                                       | Requires                                         | MCP tools                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | -------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`          | **Core**       | node base, layer tree, paints/strokes, panels, style types point + styles UI; (a)(b)(c)                   | —                                                | get_design, list_nodes, get_nodes, get_design_selection, set_design_info, create_nodes, update_nodes, delete_nodes, duplicate_nodes, select_nodes, reorder_nodes, lock_nodes, rotate_nodes, flip_nodes, export_nodes, view_design, copy_nodes_as_png, zoom_design_to_fit, zoom_to_node, undo_design, redo_design, list_recent_designs, open_design, new_design, save_design (+ align/distribute/tidy/scale/copy_properties from `canvas/mcp`) |
| `pages`         | **Core**       | every node has `pageId`; the design's `scopes`; every tool acts on a page (a)(b)                          | core, layers                                     | list_pages, switch_page, create_page, rename_page, duplicate_page, delete_page, reorder_page, move_nodes_to_page, list_guides, add_guides, remove_guides                                                                                                                                                                                                                                                                                      |
| `layers`        | **Core**       | the Layers tab, `move_layers` (the tree-move rules) (c)                                                   | core                                             | get_layer_tree, move_layers                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `frame`         | **Core**       | containers, clipping; auto-layout, section, catalog, styleguide require it (b)(c)                         | core                                             | list_frame_presets, add_preset_frame                                                                                                                                                                                                                                                                                                                                                                                                          |
| `group`         | **Core**       | Ctrl+G, child hosts; mask and sticker require it; Figma import (b)(c)                                     | core                                             | group_nodes, ungroup_nodes                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `text`          | **Core**       | text styles (variables), fonts, outlines; styleguide requires it (b)(c)                                   | core                                             | list_fonts, style_text_range                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `vector`        | **Core**       | pen/pencil, edit mode; boolean/flatten/outline produce vectors; Figma import falls back to vectors (b)(c) | core                                             | convert_to_vector                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `variables`     | **Core**       | engine in `canvas/tokens`; `bindings` on every node; the Styles section (a)(b)                            | core, pages                                      | list_variables, get_variables, create_collection, update_collection, create_mode_axis, update_mode_axis, create_variables, update_variables, delete_variables, bind_variables, unbind_variables, set_variable_mode, generate_shades, generate_scale, list_styles, create_styles, update_styles, delete_styles                                                                                                                                 |
| `effects`       | **Core**       | the effects pipeline, `effects` on every node, owns `designEffectTypes` (shader-effect extends it) (a)(b) | core                                             | — (via create/update_nodes)                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `auto-layout`   | **Core**       | `sizing`/`layoutAbsolute` on every node, relayout `afterEdit` (a)(b)                                      | core, frame                                      | add_auto_layout, remove_auto_layout                                                                                                                                                                                                                                                                                                                                                                                                           |
| `plugins-tab`   | **Core**       | the plugin manager; can't be a plugin of itself                                                           | —                                                | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `rectangle`     | Feature        | pure kind + tool; Figma import makes them; image requires it                                              | core                                             | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `ellipse`       | Feature        | kind + tool; Figma import                                                                                 | core                                             | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `polygon`       | Feature        | kind + tool + section; Figma import                                                                       | core                                             | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `star`          | Feature        | kind + tool + section; Figma import                                                                       | core                                             | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `line`          | Feature        | kind + tool + section; Figma import                                                                       | core                                             | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `section`       | Feature        | kind + tool; Figma import                                                                                 | frame                                            | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `boolean`       | Feature        | kind + commands; Figma import keeps booleans live                                                         | core, vector                                     | boolean_nodes, flatten_nodes, outline_strokes                                                                                                                                                                                                                                                                                                                                                                                                 |
| `mask`          | Feature        | `masks` hook + commands; Figma import keeps masks                                                         | core, group                                      | mask_nodes, release_masks                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `image`         | Feature        | `pasteImage`, crop, placeholders; pasting a picture needs it                                              | rectangle                                        | add_image, add_image_placeholder, replace_image                                                                                                                                                                                                                                                                                                                                                                                               |
| `sticker`       | Feature        | stamps, outline, convert to vectors                                                                       | core, group, vector, effects                     | stamp_design_stickers, restyle_design_stickers, convert_stickers_to_vectors                                                                                                                                                                                                                                                                                                                                                                   |
| `shader-effect` | Feature (Beta) | one effect type on the effects point: the model example                                                   | effects                                          | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `catalog`       | Feature        | a **mode**: the model example for "features and plugins add modes"                                        | core, pages, frame                               | list_brochures, create_brochure, rename_brochure, duplicate_brochure, delete_brochure, get_brochure, get_brochure_page, view_brochure, set_brochure_pages, add_brochure_pages, move_brochure_page, remove_brochure_pages, set_brochure_page_options, set_brochure_settings, arrange_brochure, export_brochure_pdf                                                                                                                             |
| `styleguide`    | Feature        | Design System view, built on variables                                                                    | core, pages, frame, text, variables, auto-layout | — (phase 3)                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `assets`        | Feature        | a left tab                                                                                                | —                                                | —                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**Core: 11. Features: 16.**

### 5.2 Board (14 modules)

| Module      | Tier     | Why                                                                                                                    | Requires                    | MCP tools                                                                                                                                                                                                                                                                                                                                                                         |
| ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`      | **Core** | select/hand/scale buttons, Hide UI, the tools that work on any element (b)(c)                                          | —                           | get_board, list_shapes, get_shapes, get_selection, set_board_info, create_shapes, update_shapes, delete_shapes, duplicate_shapes, select_shapes, reorder_shapes, lock_shapes, zoom_to_fit, zoom_to_shape, undo, redo, export_shapes, view_board, copy_as_png, list_recent_boards, open_board, new_board, save_board, list_plugins (+ align/distribute/tidy/scale/copy_properties) |
| `library`   | **Core** | owns the library points every module lists in (b)                                                                      | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `connector` | **Core** | `QuickConnectKind` (sticky, geo extend it), connector routing; er orders after it (b)                                  | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `text`      | **Core** | the fallback of `pasteText`; FigJam import (c)                                                                         | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `image`     | **Core** | the fallback of `pasteImage`; FigJam import (c)                                                                        | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `sticky`    | Feature  | kind + tool; db requires it (DBML notes); FigJam import                                                                | connector                   | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `geo`       | Feature  | kind + variants registry; FigJam import                                                                                | connector                   | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `section`   | Feature  | frames + alignTarget; FigJam import                                                                                    | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `draw`      | Feature  | marker/eraser, strokes; FigJam import                                                                                  | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `table`     | Feature  | table kind + gestures                                                                                                  | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `embed`     | Feature  | link cards; `pasteText` for URLs; FigJam import                                                                        | —                           | —                                                                                                                                                                                                                                                                                                                                                                                 |
| `sticker`   | Feature  | stamps                                                                                                                 | —                           | list_stickers, stamp_stickers                                                                                                                                                                                                                                                                                                                                                     |
| `db`        | Feature  | DB schema family, DBML                                                                                                 | sticky                      | get_schema_dbml, apply_schema_dbml, import_schema_dbml, tidy_schema, get_table_dbml, apply_table_dbml                                                                                                                                                                                                                                                                             |
| `er`        | Feature  | ER family, a **mode**, and **its own points** (standards, constructs): the model example for "a feature others extend" | db, connector, geo, section | list_er_diagrams, get_er_text, apply_er_text, relayout_er, check_er_diagram, er_to_tables, convert_relation_to_entity                                                                                                                                                                                                                                                             |

**Core: 5. Features: 9.**

### 5.3 App-level registries (already plugin-ready, no module)

Stickers (`stickerCatalog`, `api.stickers`), themes (`themeRegistry`, `api.themes`), ER standards and
constructs (`api.board.erStandards`/`erConstructs`). These stay app-level; nothing to change except
moving the ER points into the er module (§8).

### 5.4 What a feature or a plugin can register (the same list)

| Can register                                         | Through                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| element types (kinds)                                | `canvas.kinds`                                                 |
| tools + keys, toolbar buttons                        | `canvas.tools`, `editor.tools`                                 |
| **modes**                                            | `canvas.modes`, `editor.modes`, `editor.modeSidebars`          |
| host commands, menus, context menu                   | `canvas.hostCommands`, `editor.mainMenu`, `editor.contextMenu` |
| panels, sections, left tabs, overlays, session hooks | `editor.*`                                                     |
| effect types                                         | `effects.effectTypes` + `canvas.effectRenderers`               |
| style types                                          | core's `designStyleTypes` point                                |
| MCP tools                                            | `mcpTools`                                                     |
| file migrations                                      | `migrations`                                                   |
| stickers, themes, ER standards/constructs            | app registries / er points                                     |
| canvas hooks (paste, afterEdit, onRemove, …)         | `canvas.*`                                                     |

**Gap to close:** what features use today that `PluginApi` doesn't give is measured in §14.

---

## 6. MCP files: before → after

### 6.1 Engine and product plumbing

```
BEFORE                                          AFTER
src/canvas/agent/                               src/canvas/mcp/
  agent-tool.types.ts      (AgentTool<H>)         mcp-tool.types.ts         (McpTool<H>)
  agent-tool-group.types.ts                       mcp-tool-group.types.ts   (McpToolGroup)
  collect-agent-tools.ts                          collect-mcp-tools.ts
  arrange-tools.ts                                arrange.mcp.ts
  scale-tool.ts                                   scale.mcp.ts
  style-tool.ts                                   style.mcp.ts
  agent-patches.ts, build-element.ts, …           (same names)
  index.ts                                        index.ts

src/shared/core/mcp/mcp.types.ts (McpTool)      src/shared/core/mcp/mcp.types.ts (McpServerTool)

src/products/board/agent/                       src/products/board/mcp/          ← plumbing only
  agent-instructions.ts                           mcp-instructions.ts
  board-agent.types.ts                            board-mcp.types.ts  (AgentHost, BoardMcpTool…)
  board-access.ts                                 board-access.ts
  create-agent-tools.ts                           create-mcp-tools.ts
  apply-result.ts                                 apply-result.ts
  board-read-tools.ts        ─┐                   index.ts
  board-info-tools.ts         │
  create-shapes-tool.ts       │  move into the board's core module (§6.2)
  shape-edit-tools.ts         │
  arrange-tools.ts            │
  view-tools.ts               │
  export-tools.ts             │
  file-tools.ts               │
  plugin-tools.ts            ─┘

src/products/design/agent/                      src/products/design/mcp/
  design-agent.types.ts                           design-mcp.types.ts
  design-agent-instructions.ts                    mcp-instructions.ts
  create-design-agent-tools.ts                    create-mcp-tools.ts
  design-access.ts                                design-access.ts
```

### 6.2 Board modules

```
BEFORE                                          AFTER
modules/core/core.module.ts                     modules/core/
 (imports ../../agent/*)                          core.module.ts
                                                  README.md
                                                  index.ts
                                                  mcp/
                                                    board-read.mcp.ts     get_board list_shapes get_shapes get_selection
                                                    board-info.mcp.ts     set_board_info
                                                    create-shapes.mcp.ts  create_shapes
                                                    shape-edit.mcp.ts     update/delete/duplicate/select_shapes
                                                    arrange.mcp.ts        reorder_shapes lock_shapes (+ canvas arrange)
                                                    view.mcp.ts           zoom_to_fit zoom_to_shape undo redo
                                                    export.mcp.ts         export_shapes view_board copy_as_png
                                                    file.mcp.ts           list_recent_boards open/new/save_board
                                                    plugins.mcp.ts        list_plugins
                                                    index.ts              coreMcp groups
modules/db/db.agent-tools.ts                    modules/db/db.mcp.ts
modules/er/er.agent-tools.ts                    modules/er/er.mcp.ts
modules/er/er-diagram-arg.ts                    modules/er/er-diagram-arg.ts   (stays, helper)
modules/sticker/sticker.agent-tools.ts          modules/sticker/sticker.mcp.ts
modules/sticker/agent-stickers.ts               modules/sticker/mcp-stickers.ts
```

### 6.3 Design modules

```
BEFORE                                                AFTER
modules/core/agent/                                   modules/core/mcp/
  create-nodes.agent-tool.ts                            create-nodes.mcp.ts
  design-export.agent-tools.ts                          design-export.mcp.ts
  design-file.agent-tools.ts                            design-file.mcp.ts
  design-info.agent-tools.ts                            design-info.mcp.ts
  design-read.agent-tools.ts                            design-read.mcp.ts
  design-view.agent-tools.ts                            design-view.mcp.ts
  node-arrange.agent-tools.ts                           node-arrange.mcp.ts
  node-edit.agent-tools.ts                              node-edit.mcp.ts
  node-transform.agent-tools.ts                         node-transform.mcp.ts
  node-spec-properties.ts, summarize-node*.ts           (same names)
  index.ts                                              index.ts
modules/auto-layout/auto-layout.agent-tools.ts        modules/auto-layout/auto-layout.mcp.ts
modules/boolean/boolean.agent-tools.ts                modules/boolean/boolean.mcp.ts
modules/catalog/agent/                                modules/catalog/mcp/
  brochure-edit.agent-tools.ts                          brochure-edit.mcp.ts
  brochure-list.agent-tools.ts                          brochure-list.mcp.ts
  brochure-read.agent-tools.ts                          brochure-read.mcp.ts
  brochure-settings.agent-tools.ts                      brochure-settings.mcp.ts
  brochure-args.ts, describe-brochure.ts, index.ts      (same names)
modules/frame/frame.agent-tools.ts                    modules/frame/frame.mcp.ts
modules/group/group.agent-tools.ts                    modules/group/group.mcp.ts
modules/image/image.agent-tools.ts                    modules/image/mcp/
modules/image/placeholder.agent-tool.ts                 add-image.mcp.ts
modules/image/replace-image.agent-tool.ts               placeholder.mcp.ts
                                                        replace-image.mcp.ts
                                                        index.ts
modules/layers/layers.agent-tools.ts                  modules/layers/mcp/
modules/layers/move-layers.agent-tool.ts                layer-tree.mcp.ts
                                                        move-layers.mcp.ts
                                                        index.ts
modules/mask/mask.agent-tools.ts                      modules/mask/mask.mcp.ts
modules/pages/pages.agent-tools.ts                    modules/pages/mcp/
modules/pages/guides.agent-tools.ts                     pages.mcp.ts
                                                        guides.mcp.ts
                                                        index.ts
modules/sticker/sticker.agent-tools.ts                modules/sticker/sticker.mcp.ts
modules/text/text.agent-tools.ts                      modules/text/text.mcp.ts
modules/variables/agent/                              modules/variables/mcp/
  modes.agent-tools.ts                                  modes.mcp.ts
  scale.agent-tools.ts                                  scale.mcp.ts
  shades.agent-tools.ts                                 shades.mcp.ts
  styles-edit.agent-tools.ts                            styles-edit.mcp.ts
  styles-read.agent-tools.ts                            styles-read.mcp.ts
  variables-bind.agent-tools.ts                         variables-bind.mcp.ts
  variables-edit.agent-tools.ts                         variables-edit.mcp.ts
  variables-read.agent-tools.ts                         variables-read.mcp.ts
  describe-variables.ts, style-args.ts,                 (same names)
  variable-args.ts, index.ts
modules/vector/vector.agent-tools.ts                  modules/vector/vector.mcp.ts
```

---

## 7. Whole modules: before → after

### 7.1 A small module (`design/frame`): one `.mcp.ts`

```
BEFORE                                 AFTER
modules/frame/                         modules/frame/
  create-preset-frame.ts                 README.md                  ← new
  frame.agent-tools.ts                   index.ts
  frame.defaults.ts                      frame.module.ts
  frame.draw.ts                          frame.mcp.ts               ← renamed
  frame.factory.ts                       frame.defaults.ts
  frame.kind.ts                          frame.draw.ts
  frame-label.ts                         frame.factory.ts
  frame.module.ts                        frame.kind.ts
  frame-options.types.ts                 frame-label.ts
  frame-presets.ts                       frame-options.types.ts
  frame.types.ts                         frame-presets.ts
  index.ts                               frame.types.ts
  is-frame.ts                            create-preset-frame.ts
  preset-frame-rect.ts                   is-frame.ts
  ui/                                    preset-frame-rect.ts
                                         ui/
```

`frame.module.ts` changes one import: `import { frameMcp } from "./frame.mcp"` and
`host.contribute(designMcpTools, frameMcp)`.

### 7.2 Styles: the point and the UI are core's (changed in phase 3)

The first version of this spec moved the styles UI and the style types point to `variables`. Phase 3
found that core's Fills and Strokes sections use the styles UI (`StyleControl`, `StyleChip`,
`useNodeStyleBinding`, `createNodeStyle`), and `variables` requires `core`: moving them would make
core import variables. The point's readers are those controls, so by rule 19 both are core's:

```
BEFORE                                          AFTER
design/ui/modules/style-types.ts         ──→    modules/core/ui/core.points.ts        designStyleTypes
design/ui/modules/style-types.types.ts   ──→    modules/core/ui/core.points.types.ts  StyleTypeEntry, …
design/ui/components/styles/ (15 files)  ──→    modules/core/ui/styles/  (with core's paint/stroke editors)
                                                modules/core/ui/index.ts  the public entry
```

Core keeps registering its color and stroke style types (it owns that data); text and effects
register theirs; variables' Styles section reads the point. All of them import `../core/ui`.
`variables` keeps its own split for phase 4 (`variables.commands.ts`, `variables.sections.ts`,
`variables.migration.ts`).

### 7.3 Board core: owns the general MCP tools

```
BEFORE                                          AFTER
products/board/agent/  (15 files, tools +       products/board/mcp/      (plumbing: host, instructions,
  plumbing mixed; imports er and geo)             create-mcp-tools, access, types)
modules/core/core.module.ts                     modules/core/
                                                  README.md
                                                  index.ts
                                                  core.module.ts
                                                  core.commands.ts         toggleUi, tool.scale key
                                                  mcp/  (9 *.mcp.ts + index.ts, §6.2)
```

`products/board/agent/create-shapes-tool.ts` currently imports geo and er; in core that's a core →
feature import (rule 2). Those bits go behind the kinds (`specProperties`/`build`), which is
how the design's `create_nodes` already works.

### 7.4 The ER family: owns its points

```
BEFORE                                          AFTER
products/board/board-points.ts                  products/board/board-points.ts
  boardErStandards  (imports er types)            (canvas, mcpTools, migrations only)
  boardErConstructs
modules/er/                                     modules/er/
  er.agent-tools.ts                               README.md
  er.module.ts  (163 lines)                       index.ts
  …                                               er.module.ts            (wiring: standards, migration, MCP)
                                                  er.points.ts            boardErStandards, boardErConstructs
                                                  er.canvas.ts            kinds, tool, links, diagram hooks
                                                  er.mode.ts              the ER mode (phase 5b: one defineBoardMode)
                                                  er.commands.ts          er.convertToEntity, er.createTables
                                                  er.sections.ts          button, panel, menus, dialogs
                                                  er.mcp.ts
                                                  …                       (families as today)
```

`api.board.erStandards`/`erConstructs` stay the same names, now re-exported from the er module. There's
no `er.migration.ts`: `migrateErDiagrams` lives in `model/`, and its registration is one line in
`er.module.ts`. `styleguide.module.ts` (155 lines) is split the same way (`.canvas`, `.mode`,
`.commands`, `.sections`), and its `styleguide-points.ts` became `styleguide.points.ts`.

### 7.5 Design core: split the 380-line module

```
BEFORE                                          AFTER
modules/core/core.module.ts  (380 lines)        modules/core/
                                                  core.module.ts       ~60 lines: MCP tools, style types, the
                                                                       default mode; calls the rest
                                                  core.canvas.ts       engine hooks (order keys, clips, undrawn,
                                                                       resolveTree, withMembers, reparent, …)
                                                  core.commands.ts     flip, panels, view, hide UI, keys
                                                  core.sections.ts     tool buttons, Position, Layout, Appearance,
                                                                       Fills, Strokes, Export, Prototype, overlays,
                                                                       session hooks, Transform context menu
                                                  core.menu.ts         main menu groups (File, Edit, View, Theme)
                                                  ui/styles/core-style-types.ts  CORE_STYLE_TYPES
                                                  mcp/                 (§6.3)
```

Each split file exports a `register…(host)` function (`registerCoreCanvas`, …); `core.module.ts` calls
them. Nothing is found by its name: ESLint lets `.module.ts`, `.sections.ts`, `.menu.ts` and `.mode.ts`
import UI, and keeps `.canvas.ts`/`.commands.ts` engine-only.

### 7.6 Effects: owns its point

```
BEFORE                                          AFTER
design/ui/modules/define-effect-type.ts   ──→   modules/effects/ui/effects.points.ts  (designEffectTypes),
                                                modules/effects/ui/define-effect-type.ts
design-editor-points.ts  effectTypes      ──→   (removed from the editor points)
app/plugins/create-plugin-api.ts                api.design.effects.effectTypes (was editor.effectTypes)
```

The point is in `ui/` because its entries hold editors (React); points without components (the ER
ones) stay at a module's root.

### 7.7 Product level

```
BEFORE                                          AFTER
products/design/                                products/design/
  agent/                                          mcp/                 (plumbing)
  design-points.ts                                design-points.ts     (canvas, mcpTools, migrations, selectRedirects)
  ui/modules/                                     ui/modules/
    define-effect-type.ts        → effects          design-editor-points.ts  (no effectTypes)
    style-types.ts(.types)       → core             design-modules.ts        (core list + feature list)
    section-filters.ts, tabs-for-mode.ts, …         section-filters.ts, tabs-for-mode.ts, …
  ui/components/styles/          → core           ui/components/  (paint-picker, panel, … : product chrome)
  modules/  (one flat list)                       modules/       (same folders; §5 says which tier)
```

Each module says its tier in `defineModule({ tier })` (changed in phase 5: two arrays,
`CORE_MODULES`/`FEATURE_MODULES`, would reorder the modules, and chained hooks depend on the order), so
the tier is visible in code. Folders stay flat (no `core/` and `plugins/` subfolders) so imports don't churn.

---

## 8. Problems found (fixed by the phases)

| #   | Problem                                                                                   | Fix                                                                       |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | `pages ↔ layers` import each other's private files (Pages section sits in the Layers tab) | layers defines a `layersTabSections` point; pages contributes its section |
| 2   | `catalog → layers/…` deep import                                                          | through `../layers`                                                       |
| 3   | `variables → pages/…` deep import                                                         | through `../pages`                                                        |
| 4   | `shader-effect → effects/…`, `sticker → effects/…` deep imports                           | through `../effects`, exports added                                       |
| 5   | `er → db/…`, `er → connector/…`, `geo → connector/…`, `sticky → connector/…` deep imports | through the modules' `index.ts`                                           |
| 6   | `board-points.ts` imports er types (product → module)                                     | ER points move to `er.points.ts`                                          |
| 7   | `products/board/agent` imports geo and er (core → plugin)                                 | §7.3                                                                      |
| 8   | Style types point and styles UI outside their module (core)                               | §7.2                                                                      |
| 9   | `effectTypes` point outside effects                                                       | §7.6                                                                      |
| 10  | `core.module.ts` 380 lines, `er.module.ts` 163 lines                                      | §7.4, §7.5                                                                |
| 11  | Four MCP file shapes                                                                      | §6                                                                        |
| 12  | `CLAUDE.md` 208 KB, rules buried                                                          | §10                                                                       |

---

## 9. Module README template

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

---

## 10. `CLAUDE.md`: before → after

```
BEFORE (208 KB)                          AFTER (~15 KB)
CLAUDE.md                                CLAUDE.md
  intro                                    intro (5 lines)
  Commands                                 Commands
  Project structure                        RULES  ← numbered, imperative, first
  Layering                                   1. Verification: lint + typecheck + format:check only
  Canvas engine (≈60 KB of prose)            2. Layering (the import table)
  Elements (≈40 KB)                          3. Tiers: engine / core module / feature module
  Modules                                    4. Module anatomy + suffixes (§4)
  Agent (MCP) server                         5. MCP: `.mcp.ts`, `mcp/`, agent vs MCP words
  Collaborators and workspaces               6. Code: small files, .types.ts, kit first, no type branching
  Editors                                    7. Design system: tokens only, sharp radii
  Design (≈70 KB)                            8. Never: canvas content in React/Zustand, raw <button>, …
  Code conventions  ← the rules              Where to look: "read the README.md of the folder
  Design system                              you change, and of its parents"
                                           docs/modules.md   (the checklist + tier table, §4–§5)
                                         README.md next to the code it describes, e.g.
                                           src/canvas/README.md, src/canvas/path/README.md,
                                           src/canvas-ui/file/README.md, src/app/mcp/README.md,
                                           products/design/modules/catalog/README.md
```

The rules section is what an agent must obey; everything else is _where to look_. A rule appears once,
in `CLAUDE.md`, never repeated inside a feature description. **Descriptions live next to their code**
(decided 2026-10-26): each folder the old `CLAUDE.md` described gets a `README.md` holding that
description, so moving or deleting a folder takes its documentation with it; there is no
`docs/architecture/`. `docs/` keeps only what isn't one folder's: guides (`plugins.md`,
`collaboration.md`, `er-language.md`), roadmaps, specs, plans and `modules.md`. The `@CONTEXT` import
at the end of `CLAUDE.md` is removed.

---

## 11. Enforcement

**`scripts/check-modules.mjs`** (`pnpm check:modules`, run by `pnpm lint`) fails when (changed in
phase 5: the script checks everything; ESLint patterns can't see relative depth, `requires` or tiers):

- `files`: a `modules/<name>/` lacks `index.ts`, `<name>.module.ts` or `README.md`;
- `tier`: a built-in module doesn't say its tier;
- `deep`: an import into another module's files instead of its `index.ts`/`ui/index.ts`, from a
  module or from anywhere else in `src/` (the products' module lists may import `<name>.module`);
- `requires`: a module imports a feature that isn't in its `requires` or `uses`;
- `core-feature`: a core module imports a feature;
- `mcp`: any `*.agent-tool*.ts` file, or a `.mcp.ts` outside `<name>.mcp.ts` / `mcp/`;
- `size`: a `.module.ts` over 120 lines;
- `exports` (phase 6): a module that doesn't hand its `index.ts`/`ui/index.ts` as `exports`.

`scripts/check-public-api.mjs` (phase 6, also in `pnpm lint`) checks with the TypeScript API that
every value a feature imports from outside its folder is exported by the barrel that covers it
(rule `public`): what a plugin could reach.

`scripts/module-order.mjs` prints each product's load order, to compare before and after a change to
`requires`/`after`. Modules importing their own product barrel were fixed and are checked too (rule `barrel`, done before phase 5a, not in phase 6).

---

## 12. Migration phases

Each phase ends with `pnpm lint`, `pnpm typecheck` and `pnpm format:check` passing. Phases run **one
at a time, inline**: each gets its own plan in `docs/superpowers/plans/`, is executed, verified and
reviewed by the user before the next starts. Branches and commits are the user's: the work only
edits files.

1. **Rules.** Write `docs/modules.md` (this doc's §4–§5, §15, §16.1) and cut `CLAUDE.md` to the
   rules (§10); move the feature prose, word for word, to `README.md` files next to the code it
   describes (engine folders, products, modules). Phase 5 completes the modules' READMEs with the
   template's fields. No code changes.
2. **MCP rename (mechanical).** Files per §6, folders `agent/` → `mcp/` in modules, `canvas/agent` →
   `canvas/mcp`, `products/*/agent` → `products/*/mcp`, types and points per §3.1 (no aliases).
   Board's general tools move into `modules/core/mcp/`.
3. **Ownership moves** (done 2026-10-26). Styles UI and style types point → core (§7.2); `effectTypes` → effects
   (§7.6); ER points → er (§7.4); `pages ↔ layers` point (§8 #1): layers requires only core, pages requires core and layers.
4. **Split big module files** (done 2026-10-26; styleguide too) (§7.4, §7.5) into `.commands.ts`, `.sections.ts`, `.canvas.ts`,
   `.menu.ts`, `.migration.ts`.
5. **Public-API imports + enforcement** (done 2026-10-26; 5a done 2026-10-26, 5b done 2026-10-27). Fix §8 #2–#7, `CORE_MODULES`/`FEATURE_MODULES` lists, the
   ESLint rules and `check:modules`. Write every module's `README.md`.
   - **5a. Shared pieces** (§16): `ColorField`, `chooseImageAsset`, `ModeToolbar`,
     `useElementThumbnail`, `AnchorPicker` in `@canvas-ui`; `SelectField`/`CheckboxField`/
     `SwitchField` in the kit; the modules' `ui/index.ts`; every duplicate of §16.2 replaced.
   - **5b. Modes** (§15): `defineMode`/`registerMode` and the product helpers, the rail rule,
     `keepSections`, `onEnter`/`onLeave`; Catalog, Design system and ER moved onto them; vector
     edit's toolbar on `ModeToolbar`.
6. **Plugin API reshaped, still v1** (§14; done 2026-10-27, see §14.6): modules' `exports` and `host.require`, the barrel-shaped `api`, the gaps
   of §14.3 opened in core, features' wrong imports fixed (§14.4), `docs/plugins.md` rewritten,
   `examples/plugins/` updated; `PLUGIN_API_VERSION` stays 1 (nothing was released).
7. **Proof.** Copy `shader-effect` (smallest) to `examples/plugins/` as a real plugin, then `catalog`
   (a mode): both must work with only their import lines changed. Anything they can't reach is a gap
   left in §14.3; open it.

---

## 13. Decisions and open questions

**Decided (2026-10-25):**

1. **Design `effects`, `auto-layout`, `text` and `vector` are core.** Their data is on the node base
   (`effects`, `sizing`, `layoutAbsolute`, `sizeLimits`, frames' `layout`), other modules require them
   and the Figma import, booleans, Flatten and Outline stroke produce them. Making them features would
   mean taking their fields off the node base and a way for modules to add fields to every node, for
   something never turned off. They keep the modular folder structure (README, `.mcp.ts`, `index.ts`).
2. **Board `text` and `image` are core**: they're the fallbacks of `pasteText` and `pasteImage`, and
   the FigJam import makes them.

3. **Every feature is always on**, no switches and no "locked" tier: features are system
   functionality the app needs. What matters is that they're written against the public API, so a
   custom plugin can do the same (§14).
4. **No legacy.** The app is in alpha and no plugin exists yet: the plugin API is redesigned freely
   (§14), with no aliases or deprecated names, and **stays v1**: no plugin was released, so v1 is
   simply what it becomes. The examples are updated with it.
5. **Phases run one at a time, inline**, each reviewed before the next (§12). Branches and commits
   are left to the user; this refactor is the only work in progress meanwhile.
6. **`CLAUDE.md` is cut to the rules** (§10); the feature descriptions move to `README.md` files
   next to their code (no `docs/architecture/`), and the `@CONTEXT` import is removed.
7. **MCP tool names stay as they are** in this work. Naming them by module (`sticker_…`, a required
   plugin prefix, one shared tool per action for both products) is a separate plan.

---

## 14. The public API (what core must open)

### 14.1 Measured today

An import audit of every feature module (2026-10-25): each runtime import from outside its own folder,
checked against what `createPluginApi` hands a plugin (about 200 names picked by hand, plus the kit).

| Feature              | Imports a plugin couldn't get today | Of which: its own exports via `@design`/`@board` (not a gap, a wrong import) |
| -------------------- | ----------------------------------: | ---------------------------------------------------------------------------: |
| design/assets        |                                   2 |                                                                            0 |
| design/ellipse       |                                   2 |                                                                            0 |
| design/section       |                                   5 |                                                                            0 |
| design/rectangle     |                                   6 |                                                                            0 |
| design/polygon       |                                   6 |                                                                            1 |
| design/star          |                                   8 |                                                                            1 |
| design/line          |                                  11 |                                                                            0 |
| design/shader-effect |                                  11 |                                                                            0 |
| design/image         |                                  15 |                                                                            1 |
| design/mask          |                                  18 |                                                                            5 |
| design/sticker       |                                  37 |                                                                            5 |
| design/boolean       |                                  41 |                                                                            5 |
| design/styleguide    |                                  60 |                                                                           15 |
| design/catalog       |                                  97 |                                                                           21 |
| board/sticky         |                                   6 |                                                                            0 |
| board/geo            |                                   9 |                                                                            1 |
| board/sticker        |                                  10 |                                                                            0 |
| board/draw           |                                  18 |                                                                            0 |
| board/section        |                                  19 |                                                                            1 |
| board/table          |                                  23 |                                                                            6 |
| board/embed          |                                  28 |                                                                            5 |
| board/db             |                                  58 |                                                                            5 |
| board/er             |                                 114 |                                                                           19 |

So today **no feature but the smallest could be written as a plugin**. The reason isn't that core is
closed on purpose: the plugin API is a hand-kept list, and every time a feature needed something new
it was imported directly and never added to the list.

### 14.2 The fix: the API _is_ the barrels (no hand-kept list)

Instead of `createPluginApi` listing names one by one, `api` hands plugins **the same barrels features
import**, whole. Then rule 3 of §4 ("features import only barrels and other modules' `index.ts`") and
"what a plugin gets" are the same thing by construction, and nothing has to be remembered.

```
BEFORE (today, hand-picked)                 AFTER (v1 reshaped, barrels)
api.core     { defineModule, … 3 }          api.core      @shared/core            (module API, ids, stickers, links, …)
api.canvas   { ElementKind, … ~45 }         api.canvas    @canvas                 (whole barrel)
api.ui       { React, toast, … ~15, kit }   api.canvasUi  @canvas-ui              (whole barrel)
                                            api.ui        { kit, toast, notifyError, runWithLoading, cn }
                                            api.platform  { exportFile, pickImageFiles, readLocalFile,
                                                            http, openExternal }   (the safe, curated part)
                                            api.libs      { React, ReactDOM, icons (lucide), createStore
                                                            (zustand + persist), keyBetween / nKeysBetween
                                                            (fractional-indexing), StreamLanguage }
api.board    { canvas, editor, … }          api.board     @board + @board/ui      (points, mcp, palette,
                                                            useBoardEngine, useBoardState, SourceEditor, …)
api.design   { canvas, nodes, network,      api.design    @design + @design/ui    (points, mcp, panel,
               panel, effects, hooks, … }                   hooks, BindSlot, FontPicker, …)
                                            host.require("frame")   a module's index.ts (see 14.2.1)
api.stickers, api.themes                    api.stickers, api.themes  (unchanged)
```

`strictApi` stays: reading a name that isn't there throws, naming it.

#### 14.2.1 Modules export their public API

Features use each other (`catalog` → `frame`, `image`; `er` → `db`, `geo`; `image` → `rectangle`),
and plugins must be able to do the same, including using _another plugin's_ module. So a module
declares what it exports, and `register` can ask for what it `requires`:

```ts
// a built-in feature: imports statically, as today
import * as frame from "../frame"; // its index.ts
export const catalogModule = defineModule({
  id: "catalog",
  requires: ["core", "pages", "frame"],
  exports: catalogApi,            // what `catalog/index.ts` exports
  register(host) { … frame.createPresetFrame(…) … },
});

// a plugin: same module, the other module's exports from the host
export default function activate(api) {
  return [api.core.defineModule({
    id: "my-catalog",
    requires: ["frame"],
    register(host) {
      const frame = host.require("frame");   // the same object frame/index.ts exports
      … frame.createPresetFrame(…) …
    },
  })];
}
```

`host.require(id)` only answers for ids in `requires` (so the dependency is declared and sorted), and
a plugin's own `exports` are reachable by plugins that require it.

### 14.3 What core must open (the gaps, grouped)

Everything below is used by a feature today and must be **exported from its barrel** (engine) or from
the **core module's `index.ts`** (product), so features import it the public way and plugins get it
through §14.2.

**Engine (`@canvas`): already exported, only missing from today's list.** With whole barrels these
need nothing beyond §14.2:

- geometry: `rectFromPoints`, `rectContainsPoint`, `rectContainsRect`, `rectsIntersect`, `rectCenter`,
  `rectOf`, `roundRect`, `unionRects`, `boundsOfPoints`, `rotatedBounds`, `scalePoint`, `angleOf`,
  `normalizeAngle`, `distanceToSegmentSq`, `nearPolyline`
- paths: `booleanPaths`, `normalizePath`, `outlineStroke`, `boxSidesStroke`, `pathBounds`,
  `pointInPath`, `placePath`, `mapPath`, `mirrorPath`
- text: `measureText`, `measureWrapped`, `centerTextTop`
- color and images: `hexToRgba`, `rgbaToHex`, `imageSize`, `IDENTITY_TRANSFORM`, `isSvg`, `readSvg`
- utils: `LruCache`, `identityKey`, `Emitter`, `DocumentFeed`, `Registry`, `whenIdle`,
  `prefersReducedMotion`, `readingOrder`, `bytesToBase64`
- modes and tools: `DEFAULT_MODE`, `SelectTool`
- export: `encodePdfPages`, `canvasBlob`, `exportPath`
- variables: `TokenStore`, `resolveVariable`, `groupTree`, `elementSpec`

**Canvas UI (`@canvas-ui`)**: `useEditorMode`, `useEditorModules`, `useCanvasFile`, `useAssetUrl`,
`useScrubUndo`, `CommitInput`, `CommitTextarea`, `ImageCropOverlay`, `StickerWheel`.

**Shared (`@shared/core`, stores)**: stickers (`stickerCatalog`, `pickSticker`, `stickerPicture`,
`stickerAssetId`, `stickerSourceOf`, `findStampableSticker`, `matchesSticker`), links
(`fetchLinkPreview`, `fetchFirstImage`, `parseWebUrl`, `displayHost`, `youtubeVideo`,
`youtubeEmbedUrl`), `runWithLoading`.

**Platform (`api.platform`, curated: these touch the user's computer)**: `exportFile`,
`pickImageFiles`, `http`, `openExternal`. The DBML-only `importDbmlFile`/`exportDbmlFile` become
`exportFile`/`openFile` with a file type, so no platform call is feature-specific.

**Libraries (`api.libs`, plugins can't import npm packages)**: `React`, `ReactDOM.createPortal`,
`icons` (lucide-react; plugins can still give `{ svg }`), `createStore` (zustand, with `persist`),
`keyBetween`/`nKeysBetween` (fractional indexes for new elements; better as `@canvas` helpers so the
engine owns the dependency), `StreamLanguage` (CodeMirror, for a language in `CodeEditor`). Feature-only
libraries stay inside their feature (`perfect-freehand` in draw, `simple-icons` in embed): a plugin
bundles its own.

**Board (product + core modules)**: `useBoardEngine`, `useBoardState`, `boardMigrations` (missing from
today), `SourceEditor` (DBML/ER editor chrome), `useBoardPanelStore` (or a point for side panels' open
state), `reportApplied` (from core's mcp), the whole `palette`, and from **connector** (core):
`QuickConnectKind`, `CONNECTOR_DEFAULTS`, `SIDES`, `SIDE_DIRECTIONS`.

**Design core module (`modules/core/index.ts`)**:

- node building: `EMPTY_GEOMETRY`, `NODE_STYLE_FIELDS`, `networkGeometry`, `withoutLayerOpacity`,
  `hasVisibleStroke`, `strokeKey`, `flipPaints`, `mirrorPoint`, `toCropPaint`, `isNodeKind`
- patch checks (agents' `completePatch`): `numberField`, `nonNegative`, `wholeNumber`, `fraction`,
  `pointArg`, `checkParent`
- tree: `ChildHostKind`, `childrenByParent`, `withDescendants`, `selectionRoots`, `wrapNodes`,
  `pruneEmptyHosts`, `nextLayerName`, `treeSlots`, `siblingMasks`, `isActiveMask`, `maskType`,
  `pathToNetwork`, `DESIGN_TOKEN_CONTEXT`
- styles: `PAINT_STYLE`, `STROKE_STYLE`, `EFFECT_STYLE`, `STROKE_STYLE_PATH`, their `…StyleSummary`
- MCP plumbing: `requireNodes` (next to `requireDesign`)
- editor: `BindableNumberField`, `BindSlot` (panel), `designSelectRedirects` (point), `LayerName`
  (layers), `FontPicker` (text), `useCreateVariable` and the Variables window store (variables)

**Design's other core modules**: group (`groupNodes`, `createGroup`), vector (`createVector`), pages
(`pagesOf`, `allPagesOf`, `createPage`, `isPage`), text (`isText`, `TEXT_STYLE`, `TEXT_STYLE_PATH`,
`readTextStyle`, `textStyleSummary`), frame (`FRAME_PRESETS`, `createFrame`, `createPresetFrame`,
`findPreset`, `isFrame`), effects (`createEffect`).

**Feature → feature (through `host.require`, not core)**: image → rectangle (`createRectangle`),
catalog → image (`isPlaceholderPaint`, `replaceImageFill`), er → db (the DBML tokenizer, `freeName`,
`importSchemaText`, `schemaShapes`, `FlagToggle`, …), er → geo (`ellipseArc`), db → sticky
(`STICKY_DEFAULTS`). Each must be in the target's `index.ts`.

### 14.4 Wrong imports to fix (no API change needed)

- **Own exports through the product barrel** (`import { BOOLEAN_TYPE } from "@design"` inside
  boolean): about 100 imports in 14 features. They become relative imports inside the module.
  **Done** after phase 5 (259 files, core modules too; checked as rule `barrel`).
- **shadcn primitives imported directly** (`@shared/ui/components/ui/button`, `dropdown-menu`,
  `select`, `switch`, `tabs`, `dialog`, `popover`, `input`) and `cn` from `@shared/ui/lib/utils`:
  all are already in `@shared/ui/kit`; import them from there.
- **Deep paths** (`@design/modules/layers/ui/layer-name`, `@design/ui/stores/image-crop-store`,
  `products/board/agent/apply-result`, `…/connector/quick-connect.kind`, `…/db/schema/dbml`, …): through
  the module's or product's `index.ts`.
  **Done for module-to-module imports** in phase 5 (rule `deep`).
- **A core module knowing a feature:** `DEFAULT_SHADER_CODE` lives in effects' defaults; it belongs to
  `shader-effect` (core must not know a feature's defaults).

### 14.5 Why this scales

- One structure: a feature, a plugin's module and a core module are written the same way; only _where
  their imports come from_ differs (static `import` vs `api`/`host.require`).
- No list to keep: the public API is whatever the barrels and modules' `index.ts` export. Adding an
  export is opening it.
- Enforced: ESLint keeps features on barrels and `index.ts` (§11), so a feature can never again depend
  on something a plugin couldn't reach.
- The proof (phase 7) moves a feature out as a real plugin and checks it still works.

### 14.6 Done in phase 6 (2026-10-27)

Measured after 5b, the gaps were ~40 names, not the ~600 of §14.1: phase 5 had fixed the rest. What
changed from the plan above:

- **Names are the barrels' names**, no renaming layer: `api.board.boardCanvas`,
  `api.design.designEditor`, `api.design.defineDesignMode` (the 5b aliases `api.design.defineMode`
  etc. went; §15.3 updated). docs/plugins.md has a "Moved in version 1" table.
- **Core modules' UI and points not in a barrel** (`boardLibrary`, `designEffectTypes`,
  `FramePresetPicker`) come from `host.require(id)`; the product barrels keep the modules' engine
  side. Every built-in module hands `exports: { ...<name>Api, ...<name>Ui }` (rule `exports`).
- **`api.ui`, `api.platform`, `api.libs`** are curated files in `app/plugins/api/`; `api.libs.createStore`
  is zustand's `create`. `strictApi` wraps only the api and its groups, so values keep their own keys.
- **`@design/ui`/`@board/ui`** export the editor pieces; features still import them by path (the
  barrel would loop through the module list) and `check-public-api.mjs` keeps the two in step.
- **Engine owns fractional indexes** (`keyBetween`/`nKeysBetween`; ESLint bans `fractional-indexing`
  elsewhere). **`openFile`** replaced `pickTokenFile` and the DBML pickers (their dialog strings moved
  to db's and variables' locales). **`DEFAULT_SHADER_CODE`** and the shader agent reader moved to
  shader-effect; the **DBML and ER languages** moved into db and er.

---

## 15. Modes: one definition

### 15.1 What making a mode costs today

A mode is spread over many points, each contributed by hand:

| Piece                                                   | Point                                | Catalog  | Design system  | ER (board)   |
| ------------------------------------------------------- | ------------------------------------ | -------- | -------------- | ------------ |
| the mode itself (tool, tools, isolate, faded, commands) | `canvas.modes`                       | ✓        | ✓              | ✓            |
| its own tools                                           | `canvas.tools`                       | 2        | 1              | ✓            |
| switcher entry (label, icon, order) + toolbar           | `editor.modes`                       | ✓        | ✓              | ✓            |
| its toolbar                                             | `editor.modes.toolbar` (a component) | 90 lines | (main toolbar) | 100 lines    |
| left tabs while on                                      | `editor.leftTabs` with `modes: [id]` | 1        | 1              | —            |
| properties panel while on                               | `editor.modeSidebars`                | ✓        | ✓              | (side panel) |
| canvas overlays                                         | `editor.overlays`                    | 2        | 1              | 2            |
| session hooks (commands, enter/leave work)              | `editor.sessionHooks`                | 3        | 3              | ✓            |
| host commands                                           | `canvas.hostCommands`                | 3        | 4              | ✓            |

Findings:

- **About 10 contributions across 7 points per mode**, with the mode's id repeated in each. Forget
  one (`modes: [id]` on a tab) and the piece silently shows in the wrong mode.
- **The mode toolbars are the same component written twice**: `CatalogModeToolbar` and
  `ErModeToolbar` are both `FloatingPanel` → title → `PanelDivider` → `ToolButton`s for the mode's
  tools → `ToolButton`s for actions → Done (`useEditorMode().leave`). The vector edit toolbar
  (`toolbars` point) is the same shape again.
- **The rail is implicit:** `tabsForMode` shows a tab without `modes` only in the default mode, and a
  mode's tabs only in it. A mode can't say "my one tab, plus Layers", and the rule is written nowhere
  but that function.
- **The sidebar is all or nothing:** `modeSidebars` replaces the whole properties panel; a mode can't
  keep some normal sections (the Design system's mode would like the sheet section it already has in
  the default mode).
- **Entering and leaving** are session hooks that watch `EngineState.mode` themselves
  (`useArrangeOnEnter`, `useStyleguideScope`).

### 15.2 Proposal: `defineDesignMode` / `defineBoardMode`

**Done in 5b (2026-10-27), with these differences:** the base is `registerEditorMode(host, points,
mode)` in `@canvas-ui`, and the helpers are `registerDesignMode`/`registerBoardMode` (plugins see
them as `api.design.registerMode`/`api.board.registerMode`). `toolbar` is an item list,
`{ useItems }` (a hook, for items that depend on state) or `{ component }`. A host command's `run`
is optional (Catalog's PDF export needs React context, so a hook handles it). Design's
`modeSidebars` point became `modePanels` (`sidebar`, `keepSections`, `keepTabs`). Not done: `menu`
and board's `sidePanel` (nothing needs them yet). ER's palette stays a normal overlay, since it
also shows outside the mode.

One object describes the whole mode; one call registers it into the same points as today (nothing in
the editor changes, the helper just fans out). The engine half is a plain `CanvasMode`, so the
document side stays React-free.

```ts
// products/design/modules/catalog/catalog.mode.ts      (new suffix: .mode.ts)
import { defineDesignMode } from "@design/ui";
import { BookOpen, FileDown, LayoutGrid, ListChecks, MousePointer2, Play } from "lucide-react";

export const catalogMode = defineDesignMode({
  id: CATALOG_MODE_ID,
  label: "Catalog",
  description: "Arrange frames into a print brochure: order, options, checks and PDF.",
  icon: BookOpen,
  order: 10,

  // engine (a CanvasMode, as today)
  tool: CATALOG_TOOL,
  tools: [
    { id: CATALOG_TOOL, create: (ctx) => new CatalogTool(ctx) },
    { id: CATALOG_PICK_TOOL, create: (ctx) => new CatalogPickTool(ctx) },
  ],
  allowTools: ["hand"],
  isolate: isPageFrame,
  faded: catalogFaded,
  commands: CATALOG_ALLOWED_COMMANDS,

  // the toolbar instead of the main one: data, drawn by the shared ModeToolbar
  toolbar: [
    { tool: CATALOG_TOOL, label: "Select pages", icon: MousePointer2 },
    { tool: "hand" },                                   // label, icon, key from the tool entry
    "divider",
    { command: CATALOG_COMMANDS.pick, icon: ListChecks, activeWhen: { tool: CATALOG_PICK_TOOL } },
    { command: CATALOG_COMMANDS.arrange, icon: LayoutGrid },
    { command: CATALOG_COMMANDS.preview, icon: Play },
    { command: CATALOG_COMMANDS.exportPdf, icon: FileDown },
  ],                                                    // title and Done are added by ModeToolbar
  // or `toolbar: MyToolbar` for a fully custom one

  // the rail: exactly these tabs while the mode is on
  rail: { tabs: [{ id: "brochure", label: "Brochure", icon: BookOpen, component: BrochureTab }] },
  // rail: { tabs: […], keep: ["layers"] }             // also keep existing tabs

  // the properties panel
  sidebar: CatalogSidebar,
  // sidebar: { component: StyleguideSidebar, keepSections: ["styleguide.sheet"] }

  overlays: [BrochureOverlay, BrochurePreview],
  hostCommands: [
    { id: CATALOG_COMMANDS.pick, label: "Pick the brochure's frames", run: pickFrames },
    { id: CATALOG_COMMANDS.preview, label: "Preview the brochure", run: openPreview },
    { id: CATALOG_COMMANDS.exportPdf, label: "Export the brochure as PDF", run: exportPdf },
  ],
  onEnter: arrangeOnEnter,                              // was useArrangeOnEnter
  hooks: [useArrangeGlide],                             // anything else that runs while it exists
});

// catalog.module.ts
register(host) {
  registerMode(host, catalogMode);                      // ← replaces ~10 contributions
  host.contribute(designCanvas.kinds, new BrochureKind());
  …
}
```

What it gives a mode (the list of things a plugin can configure, all optional but `id`/`label`/
`icon`/`tool`):

| Field                                                                        | What it does                                                                            | Becomes                                    |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `tool`, `tools`, `allowTools`, `isolate`, `faded`, `commands`, `keybindings` | how the canvas behaves in it                                                            | `canvas.modes`, `canvas.tools`             |
| `label`, `description`, `icon`, `order`                                      | its button in the mode switcher                                                         | `editor.modes`                             |
| `toolbar`                                                                    | items (tools, commands, custom `run`, dividers, `disabled`/`activeWhen`) or a component | shared `ModeToolbar` or the component      |
| `rail.tabs`, `rail.keep`                                                     | **only** these left tabs (one is fine), plus kept ones                                  | `editor.leftTabs` with `modes` set for you |
| `sidebar`                                                                    | the properties panel: a component, optionally keeping some sections                     | `editor.modeSidebars`                      |
| `overlays`                                                                   | DOM over the canvas while the mode is on (mounted only then)                            | `editor.overlays`                          |
| `hostCommands` (with `run`, `keys`)                                          | commands with their handlers; no separate session hook                                  | `canvas.hostCommands` + one hook           |
| `onEnter`, `onLeave`                                                         | work on switching in/out                                                                | one session hook                           |
| `hooks`                                                                      | other session hooks                                                                     | `editor.sessionHooks`                      |
| `menu`                                                                       | a main menu group                                                                       | `editor.mainMenu`                          |

The board has the same helper without `rail` (it has no left rail) and with `sidePanel` instead of
`sidebar`: `defineBoardMode` (ER mode moves to it).

**The rail rule, written once:** in the default mode the rail shows every tab without `modes`; in any
other mode it shows **only** the mode's `rail.tabs` plus `rail.keep`. The rail's fixed buttons (main
menu, agents, panel toggle) always stay.

### 15.3 How it's imported

|                                 | Feature                                                       | Plugin                                                                        |
| ------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| define                          | `import { defineDesignMode, registerMode } from "@design/ui"` | `api.design.defineDesignMode(…)`, `api.design.registerDesignMode(host, mode)` |
| toolbar pieces (custom toolbar) | `import { ModeToolbar, ModeToolbarItem } from "@canvas-ui"`   | `api.canvasUi.ModeToolbar`                                                    |
| read the mode                   | `useEditorMode()` from `@canvas-ui`                           | `api.canvasUi.useEditorMode()`                                                |
| board                           | `import { defineBoardMode } from "@board/ui"`                 | `api.board.defineBoardMode(…)`                                                |

Catalog, the Design system and ER are rewritten on it (they're the proof), and the vector edit
toolbar uses `ModeToolbar` too.

---

## 16. Reusable pieces: export once, use everywhere

### 16.1 Where a reusable piece lives (by what it knows)

| Knows                                                       | Lives in                   | Import (feature)                     | Plugin                 |
| ----------------------------------------------------------- | -------------------------- | ------------------------------------ | ---------------------- |
| nothing but the theme (fields, selects, cards)              | `@shared/ui/kit`           | `@shared/ui/kit`                     | `api.ui.kit`           |
| the canvas engine (colors, images, thumbnails, mode chrome) | `@canvas-ui`               | `@canvas-ui`                         | `api.canvasUi`         |
| the product (paints, bindings, node fields, modes)          | `@design/ui` / `@board/ui` | `@design/ui`                         | `api.design`           |
| one module (font picker, frame presets, layer names)        | the module's `ui/index.ts` | `../text/ui` (only if in `requires`) | `host.require("text")` |

A module therefore has **two public entries**: `index.ts` (engine, plain TS) and `ui/index.ts`
(React). Its `exports` (§14.2.1) is `{ ...engine, ui }`, declared in `<name>.module.ts` (which may
import React), so `@design`'s engine barrel stays React-free.

### 16.2 What the code repeats today, and the export that replaces it

| #   | Found                                                                                                                                 | Where                                                                                                              | Proposed export                                                                                           | Lives in            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | **A color field written 4 times**: swatch → popover with `ColorPicker`, hex, opacity, a drag as one undo step, each wired its own way | `EffectColorField` (effects), `SwatchInput` + `BaseColorField` (variables), the solid case of `PaintField` (panel) | `ColorField` (`color`, `opacity?`, `label?`, `hex?: boolean`, `onChange(color, { done })`, undo built in) | `@canvas-ui`        |
| 2   | **"Choose an image" written twice**: `pickImageFiles` → `createId` → `doc.addAsset` → toast on error                                  | `ImageEditor` (paint picker), catalog `page-actions` (Replace)                                                     | `chooseImageAsset(engine, { title })` → asset id or `null`; `ImageChooseButton`                           | `@canvas-ui`        |
| 3   | **Mode toolbars written twice (three with vector edit)**                                                                              | `CatalogModeToolbar`, `ErModeToolbar`, `VectorEditToolbar`                                                         | `ModeToolbar` (items as data) + `ModeToolbarItem`                                                         | `@canvas-ui`        |
| 4   | **Frame sizes**: the presets menu exists but only the frame tool's sidebar can use it; catalog hard-codes A4                          | `FramePresetMenu`/`FramePresetGroup` (frame), `brochure-empty`                                                     | `FramePresetPicker` (`onPick(preset)`), `findPreset`, `FRAME_PRESETS`                                     | `frame/ui`, `frame` |
| 5   | **Font picker deep-imported**                                                                                                         | styleguide's `option-field` imports `@design/modules/text/ui/font-picker`                                          | `FontPicker` from text's `ui/index.ts`                                                                    | `text/ui`           |
| 6   | **Labelled select / checkbox / switch rows re-made per feature**                                                                      | catalog `SettingSelect`, `Toggle`; styleguide `ModesSwitch`, `OptionField`                                         | `SelectField`, `CheckboxField`, `SwitchField` (label + control in a `Field`)                              | `@shared/ui/kit`    |
| 7   | **Element thumbnails** (idle queue, `captureArea`, cache kept while only moved) are generic but private to catalog                    | `FrameThumbnails`, `useFrameThumbnail`, `PageThumbnail`                                                            | `useElementThumbnail(id, size)`, `ElementThumbnail`                                                       | `@canvas-ui`        |
| 8   | **Layer names deep-imported**                                                                                                         | catalog's `brochure-switcher` imports `@design/modules/layers/ui/layer-name`                                       | `LayerName` from layers' `ui/index.ts`                                                                    | `layers/ui`         |
| 9   | **The 3×3 anchor picker** is generic but sits in core's scale sidebar                                                                 | `core/ui/scale-sidebar/anchor-picker`                                                                              | `AnchorPicker`                                                                                            | `@canvas-ui`        |
| 10  | **Variables UI deep-imported**                                                                                                        | styleguide imports `variables/ui/use-create-variable` and the window store                                         | `useCreateVariable`, `openVariablesWindow(at)`                                                            | `variables/ui`      |
| 11  | **shadcn primitives and `cn` imported directly** though the kit re-exports all of them                                                | catalog, styleguide, db, er, boolean, sticker, shader-effect, embed                                                | (no new export) import from `@shared/ui/kit`                                                              | —                   |

### 16.3 The exports, as features and plugins would use them

```ts
// a feature (catalog's sidebar)
import { ColorField, chooseImageAsset, ElementThumbnail, ModeToolbar } from "@canvas-ui";
import { SelectField, SwitchField, Button } from "@shared/ui/kit";
import { PaintField, BindSlot, defineDesignMode } from "@design/ui";
import { FramePresetPicker } from "../frame/ui";          // frame is in `requires`
import { LayerName } from "../layers/ui";

// a plugin (same pieces)
export default function activate(api) {
  const { ColorField, chooseImageAsset, ElementThumbnail } = api.canvasUi;
  const { SelectField, SwitchField, Button } = api.ui.kit;
  const { PaintField, BindSlot, defineDesignMode, registerDesignMode } = api.design;
  return [api.core.defineModule({
    id: "my-feature",
    requires: ["frame", "layers"],
    register(host) {
      const { FramePresetPicker } = host.require("frame");
      const { LayerName } = host.require("layers");
      …
    },
  })];
}
```

### 16.4 The full list of reusable exports (after this work)

- **`@shared/ui/kit`** (as today) **+** `SelectField`, `CheckboxField`, `SwitchField`.
- **`@canvas-ui`**: as today (`ColorPicker`, `ColorControls`, `ColorPalette`, `CustomColorSwatch`,
  `ColorSwatch`, `HexInput`, `PercentInput`, `CommitInput`, `CommitTextarea`, `FloatingPanel`,
  `ToolButton`, `OptionButton`, `ImageCropOverlay`, `ImageQualityNote`, `StickerWheel`,
  `ExportDialog`, `VariablePicker`, `VariableChip`, `useAssetUrl`, `useScrubUndo`, `useEditorMode`,
  `useEngine`, `useEngineState`, `useEngineElement`, `useService`, `useCanvasFile`, `useSnapping`)
  **+** `ColorField`, `ColorPopover` (the swatch and picker under it, any trigger), `chooseImageAsset`,
  `ImageChooseButton`, `ModeToolbar`, `ModeToolbarItem` (the items' data type is `ModeToolbarEntry`),
  `useElementThumbnail(id)` (one size, 240 px), `ElementThumbnail`, `AnchorPicker` (done in 5a; the
  engine got `scopeOf`/`rootOf` for the thumbnails), `defineMode`/`registerMode` (the
  product-neutral base the two product helpers extend).
- **`@design/ui`**: panel (`PanelSection`, `PropertyGrid`, `NumberField`, `NodeNumberField`,
  `NodeSelectField`, `NodeCheckbox`, `NodeOptionButtons`, `PaintField`, `PaintPicker`,
  `BlendModeSelect`, `BindSlot`, `BindableNumberField`, `BindButton`), hooks (`useSelectedNodes`,
  `useEditNodes`, `useMoveNodes`, `useDesignEngine`, `useDesignState`), section filters, style UI
  (`StyleControl`, `StyleChip`, in core's `ui` per §7.2), **+** `defineDesignMode`,
  `registerMode`.
- **`@board/ui`**: `useBoardEngine`, `useBoardState`, `SourceEditor`, **+** `defineBoardMode`.
- **Modules' `ui/index.ts`**: frame (`FramePresetPicker`), text (`FontPicker`), layers
  (`LayerName`, `layersTabSections`), core (styles UI, `designStyleTypes`), variables
  (`useCreateVariable`, `openVariablesWindow()`, `useVariablesWindowOpen`), effects (the
  effect fields `ScrubField`, `EffectChoice`; `EffectColorField` became `ColorField`, `EffectToggle` the kit's `CheckboxField`), pages
  (nothing yet: its list is a `layersTabSections` entry), image (`ImageEditor` pieces), catalog/styleguide/er (what other features or
  plugins may reuse; nothing yet).

### 16.5 Phases for 15 and 16

Listed in §12 as phases 5a and 5b:

- **5a. Shared pieces:** `ColorField`, `chooseImageAsset`, `ModeToolbar`, `useElementThumbnail`,
  `AnchorPicker` to `@canvas-ui`; `SelectField`/`CheckboxField`/`SwitchField` to the kit; the
  modules' `ui/index.ts` exports; every duplicate in §16.2 replaced by them.
- **5b. Modes:** `defineMode`/`registerMode` and the product helpers, the written rail rule, sidebar
  `keepSections`, `onEnter`/`onLeave`; Catalog, Design system and ER moved onto them; vector edit's
  toolbar on `ModeToolbar`.
