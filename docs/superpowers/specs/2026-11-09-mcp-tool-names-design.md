# MCP tool names by module

_Design, 2026-11-09. Follow-up "MCP tool names by module" from the module-conventions work
(`docs/modules.md`, "MCP files": "MCP tool names are a separate plan")._

## Why

Today the ~200 MCP tools are named by hand, verb first (`create_shapes`, `set_brochure_pages`),
and Board and Design tools share one server, so clashes are dodged ad hoc: `undo` vs `undo_design`,
`zoom_to_fit` vs `zoom_design_to_fit`, `stamp_stickers` vs `stamp_design_stickers`,
`*_board_colors`. A tool whose name is taken is silently dropped (`collectMcpTools`), so a plugin
naming a tool `create_shapes` just loses it.

The user wants tool names to say **who owns them**: `<module>_<feature>_<action>`, with the prefix
added **automatically** when a module or plugin registers its tools, so nobody can forget it, fake
another module's prefix or break the rule. And an agent should only be offered the tools of the
product its tab holds.

## Goals

- Every tool name is `<prefix>_<rest>`, where the host adds `<prefix>`; a tool's code declares only
  `<rest>`.
- Built-in modules: the prefix is the **module id**, verbatim (`er`, `catalog`, `auto-layout`).
- Plugins: the prefix is the **plugin id**, verbatim (`callout`, `my-plugin`), forced: a plugin
  can't choose another.
- Board and Design share one tool where they do the same thing (`sticker_stamp`, `history_undo`);
  the call runs on whichever product the agent's tab holds.
- An agent that can be told its tools changed only sees the tools of its tab's product (plus the
  ones that need no file).
- Clashes fail loudly instead of silently dropping a tool.

## Non-goals

- No aliases for the old names: they would double a list every agent pays for in context. This is a
  one-time rename before plugin API v1.
- No change to what tools do, beyond aligning the arguments of the tools that become shared.
- Android: no agents there, nothing changes.

## Anti-goals (failure even if it works)

- An agent app that never re-reads the tool list ends up without the tools it needs after opening a
  file of the other product.
- Names that exceed client limits (see Constraints) and get the server rejected.
- A plugin able to publish tools that look built-in (`shapes_explode`).

## Constraints

- **Characters and length.** MCP (SEP-986, spec 2025-11-25) allows `A-Z a-z 0-9 _ - .`, 1–128
  characters, but several clients cap names at 64 _including their own prefix_; Claude Code adds
  `mcp__cloudy-canvas__` (20 characters). So a full tool name is at most **44** characters, using
  only lowercase letters, digits, `_` and `-` (no dots: some clients reject them). Plugin ids are
  `^[a-z0-9][a-z0-9-]*$` with no length cap today.
- Layering rules in `CLAUDE.md` hold: products never import each other; shared tool code lives in
  `canvas/mcp` (as `arrange.mcp.ts`, `scale.mcp.ts`, `style.mcp.ts`, `tabs.mcp.ts` already do);
  Rust stays transport only.
- Verification is `pnpm lint`, `pnpm typecheck`, `pnpm format:check`.

## The naming grammar

```
<prefix>_<rest>
<rest>   = [<object>_]<verb>[_to_<target>]     lowercase words joined by "_"
```

- **The action comes last**: `catalog_pages_add`, `er_text_get`, `variables_mode_set`. Verbs: `list`,
  `get`, `create`, `update`, `delete`, `set`, `add`, `remove`, plus domain verbs (`apply`, `import`,
  `export`, `stamp`, `bind`, `unbind`, `move`, `reorder`, `lock`, `rotate`, `flip`, `generate`,
  `check`, `run`, `view`, `release`, …). A conversion keeps its target after the verb:
  `model3d_convert_to_png`.
- The object is left out when the prefix already says it: `er_relayout`, `data_bind`,
  `group_create`, never `shapes_shapes_create`.
- Plural object for verbs over many (`pages_list`, `catalog_pages_remove`), singular for one
  (`catalog_page_move`), as the tool's arguments are.

### Where the prefix comes from

| Who contributes the group               | Prefix                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| A built-in feature module               | its module id, verbatim (`auto-layout_add`)                       |
| A product's `core` module               | the group's declared topic (`shapes`, `nodes`, `file`, see below) |
| Shared groups in `canvas/mcp` and `app` | their declared topic (`tabs`, `arrange`, `style`, `plugins`)      |
| A plugin's module                       | the plugin id, verbatim (`callout_create`); cannot be overridden  |

Only core modules and the shared groups may declare a topic prefix; a feature or a plugin that
declares one is an error (`scripts/check-modules.mjs` checks built-ins; the plugin loader refuses a
plugin's override). **Reserved prefixes**: every built-in module id and every topic prefix; a plugin
whose id is one of them has its tools refused (the list is derived from the built-in groups when the
server collects them, not kept by hand; my call; a core module may declare any topic and may
contribute several groups with different topics), reported in its status (`list_plugins`, the Plugins
page) like other plugin errors.

### Clashes and limits

- Two tools with the same full name **in the same product** are an error: for built-ins it throws
  at startup naming both modules (as code targets do); a plugin's clashing tool is refused and
  reported in its status. The silent skip in `collectMcpTools` goes.
- The **same name in both products** is a shared tool (below), not a clash, but only if both have
  an identical `inputSchema`; otherwise it's an error as above.
- A full name over 44 characters or outside `[a-z0-9_-]` is an error the same way (built-ins throw,
  plugin tools are refused and reported).

## Shared tools and dispatch

Each tool belongs to **board**, **design**, **both** (a shared tool) or **none** (needs no file:
tabs, recent files, opening and creating files, plugins). Board and design products keep their own
implementations of a shared tool (contributed to `boardMcpTools`/`designMcpTools` under the same
full name); the server merges them into one listed tool and, on a call, runs the implementation of
the product of the agent's tab, after `prepare` has bound and readied that tab as today. A call to
a tool the tab's product doesn't have fails with a message the agent can act on, e.g. `This tool
works on designs; your tab holds a board. Use tabs_switch or file_open.`

**Which product a call runs on** (my call, following today's binding): a bound session's tab's
product; an unbound session's call runs on the active tab's product and binds there, as today.
`prepare` already waits for a loading tab; with no file tab on screen the call fails with today's
"no file is open" message, which names `file_open`/`file_new`. The product is read at call time, so
an active tab that changed after `tools/list` is simply the one used. `file_open` by a name that
matches a board and a design returns `candidates`, as several matches do today.

The shared tools' two implementations must take identical arguments (same `inputSchema`, e.g.
`ids` in both rather than shape ids vs node ids); the description is written once for both. The
shared schema is the **union** of both sides' arguments (my call): an argument only one product can
honor is in the schema, described as "boards only" / "designs only", and ignored by the other. The
`canvas/mcp` factories (`arrangeTools`, `scaleTool`, `copyPropertiesTool`) already build both
products' versions from one source; they stop taking a `noun` for the name.

## Tool lists per session

- The server announces `tools: { listChanged: true }`.
- **A session that can hear the update** gets a **filtered list**. That's a session that keeps the
  stream open (an MCP GET on the endpoint, Server-Sent Events) **and** whose agent app is known to
  re-read the list on `notifications/tools/list_changed` (my call: opening the stream doesn't
  prove an app handles the notice, and MCP has no capability saying so). Known apps are a flag on
  their `AGENT_CLIENTS` entry (`app/mcp`, matched as agents are identified today), starting with
  Claude Code; others are added once checked. It gets: the tools of its tab's product, the shared ones and those that need no file. An
  unbound session is filtered by the **active** tab's product, since its first file call binds
  there. When the product it's filtered by changes (it binds or switches to a tab of the other
  product, or, unbound, the user activates such a tab), the server sends
  `notifications/tools/list_changed` on that stream.
- **Any other session** gets the **full list**, as today; calls to the other product's
  tools fail with the message above. So agent apps that never re-read the list keep working.
- Transport (Rust, `src-tauri/src/mcp/`): GET opens a per-session SSE stream (today it answers 405);
  the webview hears it opened and closed and sends notifications down it through a new command. All
  logic (which list, when to notify) stays in TypeScript.

## The names

Old → new, grouped by owner. **Shared** marks one tool for both products; **app** marks a tool that
needs no file.

### Core topics (both products)

| Old (board / design)                         | New                  | Kind   |
| -------------------------------------------- | -------------------- | ------ |
| `list_tabs`                                  | `tabs_list`          | app    |
| `switch_tab`                                 | `tabs_switch`        | app    |
| `list_recent_boards` / `list_recent_designs` | `file_recent_list`   | app ¹  |
| `open_board` / `open_design`                 | `file_open`          | app ¹  |
| `new_board` / `new_design`                   | `file_new`           | app ¹  |
| `list_plugins`                               | `plugins_list`       | app    |
| `get_board` / `get_design`                   | `file_get`           | shared |
| `set_board_info` / `set_design_info`         | `file_info_set`      | shared |
| `save_board` / `save_design`                 | `file_save`          | shared |
| `get_selection` / `get_design_selection`     | `selection_get`      | shared |
| `select_shapes` / `select_nodes`             | `selection_set`      | shared |
| `undo` / `undo_design`                       | `history_undo`       | shared |
| `redo` / `redo_design`                       | `history_redo`       | shared |
| `zoom_to_fit` / `zoom_design_to_fit`         | `view_fit`           | shared |
| `zoom_to_shape` / `zoom_to_node`             | `view_fit_elements`  | shared |
| `view_board` / `view_design`                 | `view_snapshot`      | shared |
| `copy_as_png` / `copy_nodes_as_png`          | `clipboard_png_copy` | shared |
| `align_shapes` / `align_nodes`               | `arrange_align`      | shared |
| `distribute_shapes` / `distribute_nodes`     | `arrange_distribute` | shared |
| `tidy_up_shapes` / `tidy_up_nodes`           | `arrange_tidy_up`    | shared |
| `scale_shapes` / `scale_nodes`               | `arrange_scale`      | shared |
| `copy_properties_to_shapes` / `…_to_nodes`   | `style_copy`         | shared |

¹ One tool replacing two: a `type` argument (`"board"` / `"design"`), required for `file_new`,
optional for `file_open` (by name it searches both, as today's name lookup does) and
`file_recent_list` (both when left out).

### Board core (`shapes`)

| Old                | New                |
| ------------------ | ------------------ |
| `list_shapes`      | `shapes_list`      |
| `get_shapes`       | `shapes_get`       |
| `create_shapes`    | `shapes_create`    |
| `update_shapes`    | `shapes_update`    |
| `delete_shapes`    | `shapes_delete`    |
| `duplicate_shapes` | `shapes_duplicate` |
| `reorder_shapes`   | `shapes_reorder`   |
| `lock_shapes`      | `shapes_lock`      |
| `export_shapes`    | `shapes_export`    |

### Design core (`nodes`)

| Old               | New               |
| ----------------- | ----------------- |
| `list_nodes`      | `nodes_list`      |
| `get_nodes`       | `nodes_get`       |
| `create_nodes`    | `nodes_create`    |
| `update_nodes`    | `nodes_update`    |
| `delete_nodes`    | `nodes_delete`    |
| `duplicate_nodes` | `nodes_duplicate` |
| `reorder_nodes`   | `nodes_reorder`   |
| `lock_nodes`      | `nodes_lock`      |
| `rotate_nodes`    | `nodes_rotate`    |
| `flip_nodes`      | `nodes_flip`      |
| `export_nodes`    | `nodes_export`    |

### Modules in both products

| Old (board / design)                                 | New                         | Kind   |
| ---------------------------------------------------- | --------------------------- | ------ |
| `list_stickers` (board)                              | `sticker_list`              | app ²  |
| `stamp_stickers` / `stamp_design_stickers`           | `sticker_stamp`             | shared |
| `restyle_design_stickers`                            | `sticker_restyle`           | design |
| `convert_stickers_to_vectors`                        | `sticker_convert_to_vector` | design |
| `add_model` / `add_model_node`                       | `model3d_add`               | shared |
| `set_model_view` / `set_model_node_view`             | `model3d_view_set`          | shared |
| `convert_model_to_png` / `convert_model_node_to_png` | `model3d_convert_to_png`    | shared |

² The sticker registry is app-wide, so listing needs no file (my call): it becomes a "none" tool
both products' agents see, instead of new design-side code.

### Board modules

| Module      | Old → new                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colors`    | `list_board_colors` → `colors_list`, `create_board_colors` → `colors_create`, `update_board_colors` → `colors_update`, `delete_board_colors` → `colors_delete`, `create_board_color_collection` → `colors_collection_create`, `bind_board_colors` → `colors_bind`, `unbind_board_colors` → `colors_unbind`, `set_board_color_mode` → `colors_mode_set`, `import_board_colors` → `colors_import`, `export_board_colors` → `colors_export` |
| `db`        | `get_schema_dbml` → `db_schema_get`, `apply_schema_dbml` → `db_schema_apply`, `import_schema_dbml` → `db_schema_import`, `tidy_schema` → `db_schema_tidy`, `get_table_dbml` → `db_table_get`, `apply_table_dbml` → `db_table_apply`                                                                                                                                                                                                      |
| `db-export` | `list_code_targets` → `db-export_targets_list`, `export_schema_code` → `db-export_code_get`                                                                                                                                                                                                                                                                                                                                              |
| `er`        | `list_er_diagrams` → `er_diagrams_list`, `get_er_text` → `er_text_get`, `get_er_mermaid` → `er_mermaid_get`, `apply_er_text` → `er_text_apply`, `relayout_er` → `er_relayout`, `check_er_diagram` → `er_diagram_check`, `er_to_tables` → `er_convert_to_tables`, `convert_relation_to_entity` → `er_relation_convert_to_entity`                                                                                                          |

### Design modules

| Module         | Old → new                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auto-layout`  | `add_auto_layout` → `auto-layout_add`, `remove_auto_layout` → `auto-layout_remove`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `boolean`      | `boolean_nodes` → `boolean_apply`, `flatten_nodes` → `boolean_flatten`, `outline_strokes` → `boolean_strokes_outline`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `catalog`      | `list_brochures` → `catalog_brochures_list`, `get_brochure` → `catalog_brochure_get`, `create_brochure` → `catalog_brochure_create`, `rename_brochure` → `catalog_brochure_rename`, `duplicate_brochure` → `catalog_brochure_duplicate`, `delete_brochure` → `catalog_brochure_delete`, `view_brochure` → `catalog_brochure_view`, `set_brochure_settings` → `catalog_brochure_settings_set`, `arrange_brochure` → `catalog_brochure_arrange`, `export_brochure_pdf` → `catalog_brochure_pdf_export`, `get_brochure_page` → `catalog_page_get`, `set_brochure_pages` → `catalog_pages_set`, `add_brochure_pages` → `catalog_pages_add`, `remove_brochure_pages` → `catalog_pages_remove`, `move_brochure_page` → `catalog_page_move`, `set_brochure_page_options` → `catalog_page_options_set`, `create_brochure_master` → `catalog_master_create`, `remove_brochure_master` → `catalog_master_remove`, `detach_master_layer` → `catalog_master_layer_detach`, `set_brochure_sections` → `catalog_sections_set`, `add_page_item` → `catalog_page_item_add`, `set_page_item` → `catalog_page_item_set`, `set_brochure_repeat` → `catalog_repeat_set`, `remove_brochure_repeat` → `catalog_repeat_remove`            |
| `color-wizard` | `run_color_wizard` → `color-wizard_run`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `data`         | `list_data_sources` → `data_sources_list`, `get_data_source` → `data_source_get`, `add_data_source` → `data_source_add`, `update_data_source` → `data_source_update`, `set_data_source` → `data_source_set`, `remove_data_source` → `data_source_remove`, `bind_data` → `data_bind`, `set_repeat` → `data_repeat_set`, `repeat_layer` → `data_layer_repeat`, `remove_repeat` → `data_repeat_remove`, `detach_data_copy` → `data_copy_detach`, `get_data_issues` → `data_issues_get`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `frame`        | `list_frame_presets` → `frame_presets_list`, `add_preset_frame` → `frame_preset_add`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `group`        | `group_nodes` → `group_create`, `frame_nodes` → `group_frame_create`, `ungroup_nodes` → `group_release`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `image`        | `add_image` → `image_add`, `add_image_placeholder` → `image_placeholder_add`, `replace_image` → `image_replace`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `layer-export` | `set_layer_exports` → `layer-export_set`, `export_layers` → `layer-export_run`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `layers`       | `get_layer_tree` → `layers_tree_get`, `move_layers` → `layers_move`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mask`         | `mask_nodes` → `mask_create`, `release_masks` → `mask_release`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `pages`        | `list_pages` → `pages_list`, `switch_page` → `pages_switch`, `create_page` → `pages_create`, `rename_page` → `pages_rename`, `duplicate_page` → `pages_duplicate`, `delete_page` → `pages_delete`, `reorder_page` → `pages_reorder`, `move_nodes_to_page` → `pages_nodes_move`, `list_guides` → `pages_guides_list`, `add_guides` → `pages_guides_add`, `remove_guides` → `pages_guides_remove`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `prototype`    | `list_flows` → `prototype_flows_list`, `set_flow` → `prototype_flow_set`, `remove_flow` → `prototype_flow_remove`, `get_interactions` → `prototype_interactions_get`, `set_interactions` → `prototype_interactions_set`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `styleguide`   | `get_design_system` → `styleguide_get`, `set_system_template` → `styleguide_template_set`, `add_system_element` → `styleguide_element_add`, `convert_system_element` → `styleguide_element_convert`, `view_design_system` → `styleguide_view`, `export_design_system` → `styleguide_export`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `text`         | `list_fonts` → `text_fonts_list`, `style_text_range` → `text_range_style`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `variables`    | `list_variables` → `variables_list`, `get_variables` → `variables_get`, `create_variables` → `variables_create`, `update_variables` → `variables_update`, `delete_variables` → `variables_delete`, `bind_variables` → `variables_bind`, `unbind_variables` → `variables_unbind`, `set_variable_mode` → `variables_mode_set`, `create_collection` → `variables_collection_create`, `update_collection` → `variables_collection_update`, `create_mode_axis` → `variables_mode_axis_create`, `update_mode_axis` → `variables_mode_axis_update`, `generate_shades` → `variables_shades_generate`, `generate_scale` → `variables_scale_generate`, `generate_type_scale` → `variables_type_scale_generate`, `list_styles` → `variables_styles_list`, `create_styles` → `variables_styles_create`, `update_styles` → `variables_styles_update`, `delete_styles` → `variables_styles_delete`, `get_token_usage` → `variables_usage_get`, `find_unused_tokens` → `variables_unused_find`, `replace_token` → `variables_token_replace`, `detach_tokens` → `variables_tokens_detach`, `check_contrast` → `variables_contrast_check`, `export_tokens` → `variables_tokens_export`, `import_tokens` → `variables_tokens_import` |
| `vector`       | `convert_to_vector` → `vector_convert`, `import_svg` → `vector_svg_import`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Plugins

The `callout` example plugin's tool becomes `callout_<rest>`; `examples/plugins` are updated.
`docs/plugins.md` explains the prefix, the grammar, the reserved prefixes and the 44-character limit
(the plugin id counts toward it).

## Everything that names tools

All of these move to the new names in the same change:

- The tools' descriptions and error messages that name other tools (`update_${noun}` in
  `scale.mcp.ts`, "Use list_shapes…", …).
- The MCP instructions (`products/*/mcp/mcp-instructions.ts`). They stay one block sent on
  `initialize` (my call: a session's product changes after it connects), reorganized in three
  parts: what both products share (files, tabs, the shared tools and the tab rule above), then
  boards, then designs, so shared tools are described once.
- The Agents tools dialog (`agent-tool-catalog.ts`): shared tools and those that need no file get
  their own section before "Board" and "Design" (my call); plugin sections list their full names.
- The activity label (`app/mcp/agent-call-label.ts`): it reads the verb from the **end** now
  (before `_to_<target>` when there is one) and still gives "Creating shapes" / "Created shapes"; a
  plugin's id prefix is dropped from the sentence.
- `list_plugins`'s per-plugin tool names (`app/mcp/agent-plugins.ts`) report full names.
- READMEs (each module's "MCP tools:" line, `canvas/mcp`, `app/mcp`, `src-tauri/src/mcp`, the
  products'), `docs/modules.md` ("MCP files": replace the "separate plan" line with the rule),
  `docs/plugins.md`.
- `CHANGELOG.md` / `CHANGELOG.es.md`, under Improved: the agent tools have new, organized names and
  agents only see the tools of the file they're working on; users with saved permission lists for
  the old names need to allow the new ones.

## Left to the builder

- Where the prefix is applied (a `prefixFor(group)` given to `collectMcpTools`, the group's
  owner from `modules.ownerOf`, the plugin from the plugin status's module list) and how a group
  declares a topic prefix (a `prefix` field on `McpToolGroup`).
- How the server definition exposes per-session lists (e.g. `toolsFor(context)` next to `tools`).
- The SSE stream's details (keep-alive, what the webview event and command are called).
- Aligning the arguments of the tools that become shared; when one product's version has an
  argument the other can't honor, it's accepted and documented as "boards only" / "designs only"
  rather than splitting the tool.
- Whether `check-modules.mjs` also lints the local names against the grammar.
- Small naming calls inside the grammar where this table proves awkward once descriptions are
  rewritten; the table is the default, the grammar is the rule.
