# Images

Pictures in designs: pasting or dropping an image makes a rectangle filled with it; fills can be cropped and replaced, and placeholder pictures mark where one goes.

- **Tier:** feature
- **Requires:** rectangle
- **Contributes:** designCanvas: `hostCommands`, `pasteImage`; designEditor: `contextMenu`, `overlays`, `selectionActions`, `sessionHooks`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `add_image`, `add_image_placeholder`, `replace_image`
- **Files:** `image-rectangle.ts`, `replace-image-fill.ts`, `placeholder/` (placeholder pictures), `mcp/`, `ui/`.

## How it works

- **Images** (`modules/image/`): pasted or dropped images become a rectangle named "Image" filled with them (`createImageRectangle`, the `pasteImage` hook), at their pixel size shrunk to 80% of the view. **Placeholders** (`image/placeholder/`) mark where a picture goes: an image fill whose asset is an SVG of the layer's color (its first visible solid fill, else `DEFAULT_PLACEHOLDER_COLOR`) with the foca watona and a "?" (`placeholderSvg`, `placeholderInk` from `@canvas`, `canvas/image/`), its id derived from the color and proportions (`placeholder:<HEX>:<w>x<h>`, `addPlaceholderPaint`, shared by alike placeholders), which is how `isPlaceholderPaint`/`isPlaceholderAsset` (core's, `core/node/placeholder-paint.ts`, since catalog and the paint editors read them too) tell them apart; any replacement (a fresh `createId()` asset) makes it a picture again. Made by the paint picker's Add placeholder (`ImageEditor`, `placeholderColor`), the `imagePlaceholder` host command ("Use as image placeholder" in the selection's context menu, `placeholderPatches`, `canHoldPlaceholder`) and agents' `add_image_placeholder` (`ids`, or a new rectangle).
