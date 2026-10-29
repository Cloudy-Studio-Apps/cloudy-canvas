# Pictures

Pasted and dropped pictures on a board, cropped on the canvas (double-click), with their panel.

- **Tier:** core
- **Requires:** —
- **Contributes:** kinds `ImageKind`; boardCanvas: `editElement`, `kinds`, `options`, `pasteImage`; boardEditor: `overlays`, `selectionPanels`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `image.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `image.kind.ts`, `pasted-image.ts`, `image-crop.ts`, `image.draw.ts`, `ui/`.

## How it works

- `image/`: `ImageKind extends BoxKind`, a picture pasted from the clipboard (`assetId` points at the document asset). Its bounds include its `padding` (default 0) and its `background` is `"none"` (transparent, the default) or `"white"`, both picked in the options panel (`ui/image-options.tsx`); changing the padding grows the bounds around the image. It always resizes proportionally (`keepsRatio`) and isn't created by agents; they move and resize it and set `background` and `padding` (`imagePaddingPatch`, shared with `restyle`). Its `crop` (an `ImageCrop`, the part of the picture shown, or `null`) is edited on the canvas: double-click (the module's `editElement`, `editImage`, which asks the host with `ctx.activate(id, IMAGE_ACTIONS.crop)`) or the panel's Crop opens `ui/image-crop.tsx` (the `ImageCropOverlay` with `clamp`, state in `ui/image-crop-store.ts`); `imageCropPatch` (agents' `crop`, the panel's Reset crop) moves the bounds round the part shown so the picture keeps its scale. The FigJam import keeps axis-aligned crops (`imageCrop`).
