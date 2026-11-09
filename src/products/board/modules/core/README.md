# Board core

What every board has whatever its other modules: the select, scale and hand buttons, Hide UI and the agent tools that work on any shape.

- **Tier:** core
- **Requires:** —
- **Contributes:** boardCanvas: `hostCommands`, `keybindings`; boardEditor: `mainMenu`, `modes`, `sessionHooks`, `tools`; `boardMcpTools`
- **Points it owns:** `boardStarters` (`ui/core.points.ts`): Home's ready-made starts for a new board (`BoardStarter`, a `CanvasStarter`), run on a new file by the `start-starter` session hook (`useBoardStartStarter`) when its link has `?starter=<id>`; er, db and section give theirs, plugins more
- **File tools:** `file_get`, `file_info_set` and `file_save`, shared with designs; listing, opening and creating files and listing plugins are the app-level `file_recent_list`, `file_open`, `file_new` and `plugins_list` (`canvas/mcp/files.mcp.ts`, `plugins.mcp.ts`).
- **MCP tools:** shared with designs (the description and arguments in `canvas/mcp/shared/` or the `canvas/mcp` factories, the board's `run` here): `file_get`, `file_info_set`, `file_save`, `selection_get`, `selection_set`, `history_undo`, `history_redo`, `view_fit`, `view_fit_elements`, `view_snapshot`, `clipboard_png_copy`, `arrange_align`, `arrange_distribute`, `arrange_tidy_up`, `arrange_scale`, `style_copy`; the board's own, still under the transitional `board` prefix: `create_shapes`, `delete_shapes`, `duplicate_shapes`, `export_shapes`, `get_shapes`, `list_shapes`, `lock_shapes`, `reorder_shapes`, `update_shapes`
- **Files:** `core.viewer.ts` (the module the HTML viewer loads instead), `core.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `core.menu.ts` (the main menu's File, Edit, View, Settings and About groups, shown by the title bar's seal), `core.module.ts`, `ui/` (the starters point and its session hook), `mcp/` (one file per shared topic: `file`, `selection`, `history`, `view`, `clipboard`, `arrange`, `style`, with `arrange-options.ts`; then reading, creating, editing, ordering and exporting shapes).

## How it works

What every board has whatever its modules: the select, scale (Shift+K; K is the sticker tool) and hand tools' buttons (the tools are built into the engine), Hide UI (Ctrl+\) and the agent tools that work on any element (reading, creating and editing through the kinds, arranging, viewing, exporting and saving).
