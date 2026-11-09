# 3D models

A 3D model on the board: dropped or placed from a file, shown as a picture, turned live in 3D when
edited, and convertible to a plain PNG image.

- **Tier:** feature
- **Requires:** — (converting a model makes an `image`, a core module)
- **Contributes:** kinds `Model3dKind`; boardCanvas: `kinds`, `editElement`, `assetSweeps`, `importFiles`, `hostCommands`; boardEditor: `sidePanels`, `overlays`, `sessionHooks`, `contextMenu`; `boardMcpTools`
- **Points it owns:** —
- **MCP tools:** `add_model`, `set_model_view`, `convert_model_to_png`
- **Files:** `model3d.viewer.ts` (the module the HTML viewer loads: the canvas side only, so the export shows the picture), `model3d.canvas.ts` (kind, double-click, the asset sweep), `model3d.kind.ts`, `model3d.factory.ts`, `convert-model.ts`, `model3d.commands.ts`, `model3d.sections.ts`, `mcp/`, `ui/`.

## How it works

- `Model3dKind extends BoxKind` and implements `ModelKind` (`modelData(el)`). A `ModelElement` is the
  base element plus `ModelData` (`@canvas`): the model's assets, its `angle` (the model's turn; never
  `rotation`) and `zoom`, its `textures` slots and the saved `pictureAssetId`. It keeps its
  proportions, isn't created with the shape tools and is not rotatable. `assets(el)` is only the
  picture, so copies, exports and the HTML viewer draw the picture and carry nothing else.
- **At rest** it draws the picture (`view.placeImage`), always. While this user has it live the
  editor covers it on screen (`engine.coverElements`, done by `useModelEditSession`) because the
  live view is transparent; exports, thumbnails and agents' pictures keep showing the picture.
- **Dropping** model files goes through the `importFiles` hook (`importModelFiles` with
  `createModel`); the canvas menu's **Place 3D model…** picks a file and places it in the view.
  `ModelSizeDialog` (an overlay) answers the warning over 10 MB.
- **Editing:** double-click, Enter or the context menu's **Edit in 3D** send `MODEL_ACTIONS.edit`;
  `ui/model3d-live.tsx` (an overlay) mounts `ModelLiveView` from `useModelEditSession`. The panel
  (`ui/model3d-panel.tsx`, in the side dock since it is taller than the selection bar) is the shared
  `ModelPanel`. Edit is disabled for a copy that has only the picture (no model file).
- **Convert:** **Convert to PNG** (menu and panel) opens `ConvertModelDialog`, then
  `convertModelToImage(engine, el)` swaps the model for an `image` with the same box and z-order in
  one undo step and the new image is selected. The user's unfinished edit is written first. It
  refuses while anyone has the model live.
- **Agents:** `add_model` imports, bakes and adds (the size warning is in the result, no dialog),
  `set_model_view` re-bakes off screen and writes angle, zoom, textures and picture in one undo
  step, `convert_model_to_png` converts. The last two fail with "being edited" while the model is
  live for anyone (the user included), checked before any read or write. Agents move and resize
  models with `update_shapes` (`x y w h` are patchable; `angle` and `zoom` are refused and only change through `set_model_view`, which redraws the picture).
