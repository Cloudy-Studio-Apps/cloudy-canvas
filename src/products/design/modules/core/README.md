# Design core

What every design has whatever its other modules: the node base and the layer tree, paints and strokes, the move, scale and hand tools, the properties panel's shared sections, styles' controls, the main menu and the agent tools that work on any layer.

- **Tier:** core
- **Requires:** —
- **Contributes:** designCanvas: `alignTarget`, `clips`, `drawOrder`, `frames`, `hostCommands`, `keybindings`, `onMoved`, `pasteOnto`, `prepareCopies`, `resolveElements`, `rootOf`, `rulerFrame`, `selectTarget`, `undrawn`, `view`, `withMembers`; designEditor: `contextMenu`, `mainMenu`, `modes`, `overlays`, `propertySections`, `sessionHooks`, `toolSidebars`, `tools`; `designMcpTools`, `designStyleTypes`
- **Points it owns:** `designStyleTypes` (`ui/core.points.ts`): the kinds of style in the Styles section; core gives color and stroke, text and effects theirs, plugins more. `designStarters` (`ui/core.points.ts`): Home's ready-made starts for a new design (`DesignStarter`, a `CanvasStarter`), run on a new file by the `start-starter` session hook (`useDesignStartStarter`) when its link has `?starter=<id>`; frame and catalog give theirs, plugins more
- **MCP tools:** `copy_nodes_as_png`, `create_nodes`, `delete_nodes`, `duplicate_nodes`, `export_nodes`, `flip_nodes`, `get_design`, `get_design_selection`, `get_nodes`, `list_nodes`, `list_recent_designs`, `lock_nodes`, `new_design`, `open_design`, `redo_design`, `reorder_nodes`, `rotate_nodes`, `save_design`, `select_nodes`, `set_design_info`, `undo_design`, `update_nodes`, `view_design`, `zoom_design_to_fit`, `zoom_to_node`
- **Files:** `core.canvas.ts`, `core.commands.ts`, `core.sections.ts`, `core.menu.ts` (wiring), `node/` (`DesignNodeKind`, paints, strokes), `tree/` (the layer tree's hooks), `styles/` (paint, stroke and effect style data), `transform/`, `tools/`, `network/` (vector networks), `mcp/`, `ui/` (sections, styles UI, `core.points.ts`).

## How it works

What every design has whatever its modules: the canvas view (plain, pixel grid, 2%–25600%, size label, snapping) and the layer tree's hooks (`core.canvas.ts`), its commands (`core.commands.ts`), the move, scale (K) and hand buttons and the properties panel's shared sections (`core.sections.ts`), the main menu (`core.menu.ts`), color and stroke styles, and the agent tools that work on any layer (reading, creating and editing through the kinds, arranging, viewing, exporting, files).
