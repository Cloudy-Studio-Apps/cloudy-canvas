# 3D models

A 3D model on a design: dropped or placed from a file, shown as a picture, turned live in 3D when
edited, and convertible to a rectangle filled with its PNG.

- **Tier:** feature
- **Requires:** rectangle (converting a model makes a `rectangle`)
- **Contributes:** kinds `ModelNodeKind`; designCanvas: `kinds`, `editElement`, `assetSweeps`, `importFiles`, `hostCommands`; designEditor: `propertySections`, `layerIcons`, `overlays`, `sessionHooks`, `mainMenu`, `contextMenu`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `add_model_node`, `set_model_node_view`, `convert_model_node_to_png`
- **Files:** `model3d.canvas.ts` (kind, double-click, the asset sweep, host commands), `model3d.kind.ts`, `model3d.factory.ts`, `convert-model.ts`, `model3d.commands.ts`, `model3d.sections.ts` (the editor's entries), `mcp/`, `ui/`.

## How it works

- `ModelNodeKind extends DesignNodeKind` and implements `ModelKind` (`modelData(el)`), modelled on
  the sticker: a `ModelNodeElement` is a `DesignNode` plus `ModelData` (`@canvas`: the model's
  assets, its `angle`, `zoom`, `textures` slots and the saved `pictureAssetId`). It draws the
  picture as a `fit` image paint over its box, takes no fills or strokes, keeps its proportions,
  flips mirrored and reports only the picture as its `assets`. The layer's own `rotation` turns the
  picture like any layer; `angle` is the model's turn. `createModelNode(data, rect, index, name?)`
  names it after the file.
- **At rest** it always draws the picture. While this user has it live the editor covers it on
  screen (`engine.coverElements`, done by `useModelEditSession`); exports and agents' pictures keep
  showing it.
- **Dropping** model files goes through the `importFiles` hook (`importModelFiles` with
  `createModelNode`, at the top of the page); the main menu's **Place 3D model…** picks a file and
  places it in the view. `ModelSizeDialog` (an overlay) answers the warning over 10 MB.
- **Editing:** double-click, Enter or the context menu's **Edit in 3D** send `MODEL_ACTIONS.edit`;
  `ui/model3d-live.tsx` (an overlay) mounts `ModelLiveView`. The properties panel section
  (`ui/model3d-section.tsx`, only for a single selected model) is the shared `ModelPanel`. Edit is
  disabled for a copy that has only the picture (no model file) and for a read-only design.
- **Convert:** **Convert to PNG** (menu and panel) opens `ConvertModelDialog`, then
  `convertModelToRectangle(engine, el)` swaps the model for a `rectangle` with an image fill of the
  picture, in one undo step, keeping its box, name, parent, z-order, page, rotation, opacity,
  visibility, lock and other layer settings; the new rectangle is selected. The user's unfinished
  edit is written first. It refuses while anyone has the model live.
- **Agents:** `add_model_node` imports, bakes and adds (`parent` as `add_image`; the size warning is
  in the result, no dialog), `set_model_node_view` re-bakes off screen and writes angle, zoom,
  textures and picture in one undo step, `convert_model_node_to_png` converts. The last two fail
  with "being edited" while the model is live for anyone (the user included), checked before any
  read or write and again before writing. The tools' shared pieces live in `canvas/model3d/mcp/`
  and are the board's too. Agents move and resize models with `update_nodes` (`angle` and `zoom`
  are checked; the model's files can't be patched).
