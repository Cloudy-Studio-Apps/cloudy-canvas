# Board core

What every board has whatever its other modules: the select, scale and hand buttons, Hide UI and the agent tools that work on any shape.

- **Tier:** core
- **Requires:** —
- **Contributes:** boardCanvas: `hostCommands`, `keybindings`; boardEditor: `modes`, `sessionHooks`, `tools`; `boardMcpTools`
- **Points it owns:** —
- **MCP tools:** `copy_as_png`, `create_shapes`, `delete_shapes`, `duplicate_shapes`, `export_shapes`, `get_board`, `get_selection`, `get_shapes`, `list_plugins`, `list_recent_boards`, `list_shapes`, `lock_shapes`, `new_board`, `open_board`, `redo`, `reorder_shapes`, `save_board`, `select_shapes`, `set_board_info`, `undo`, `update_shapes`, `view_board`, `zoom_to_fit`, `zoom_to_shape`
- **Files:** `core.module.ts`, `mcp/` (reading, creating and editing shapes, arranging, viewing, exporting, files, plugins).

## How it works

What every board has whatever its modules: the select, scale (Shift+K; K is the sticker tool) and hand tools' buttons (the tools are built into the engine), Hide UI (Ctrl+\) and the agent tools that work on any element (reading, creating and editing through the kinds, arranging, viewing, exporting, files and plugins).
