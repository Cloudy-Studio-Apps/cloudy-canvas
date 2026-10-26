# Image (Board module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Image

- `image/`: `ImageKind extends BoxKind`, a picture pasted from the clipboard (`assetId` points at the document asset). Its bounds include its `padding` (default 0) and its `background` is `"none"` (transparent, the default) or `"white"`, both picked in the options panel (`ui/image-options.tsx`); changing the padding grows the bounds around the image. It always resizes proportionally (`keepsRatio`) and isn't created by agents; they move and resize it and set `background` and `padding` (`imagePaddingPatch`, shared with `restyle`). Its `crop` (an `ImageCrop`, the part of the picture shown, or `null`) is edited on the canvas: double-click (the module's `editElement`, `editImage`, which asks the host with `ctx.activate(id, IMAGE_ACTIONS.crop)`) or the panel's Crop opens `ui/image-crop.tsx` (the `ImageCropOverlay` with `clamp`, state in `ui/image-crop-store.ts`); `imageCropPatch` (agents' `crop`, the panel's Reset crop) moves the bounds round the part shown so the picture keeps its scale. The FigJam import keeps axis-aligned crops (`imageCrop`).
