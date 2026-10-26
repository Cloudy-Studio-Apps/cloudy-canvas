# Image (Design module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Images

- **Images** (`modules/image/`): pasted or dropped images become a rectangle named "Image" filled with them (`createImageRectangle`, the `pasteImage` hook), at their pixel size shrunk to 80% of the view. **Placeholders** (`image/placeholder/`) mark where a picture goes: an image fill whose asset is an SVG of the layer's color (its first visible solid fill, else `DEFAULT_PLACEHOLDER_COLOR`) with the foca watona and a "?" (`placeholderSvg`, `placeholderInk`), its id derived from the color and proportions (`placeholder:<HEX>:<w>x<h>`, `addPlaceholderPaint`, shared by alike placeholders), which is how `isPlaceholderPaint`/`isPlaceholderAsset` tell them apart; any replacement (a fresh `createId()` asset) makes it a picture again. Made by the paint picker's Add placeholder (`ImageEditor`, `placeholderColor`), the `imagePlaceholder` host command ("Use as image placeholder" in the selection's context menu, `placeholderPatches`, `canHoldPlaceholder`) and agents' `add_image_placeholder` (`ids`, or a new rectangle).
