// Images: pasted or dropped pictures become rectangles with an image fill (`image.module.ts`),
// a layer's image fill can take another picture (`replaceImageFill`), and a placeholder picture
// (the layer's color with the foca watona and a "?") marks where one goes (`placeholder/`).
export { createImageRectangle } from "./image-rectangle";
export { placeImage } from "./place-image";
export type * from "./place-image.types";
export { relinkImageAsset } from "./relink-image-asset";
export { firstImageFill, replaceImageFill } from "./replace-image-fill";
export {
  addPlaceholderPaint,
  DEFAULT_PLACEHOLDER_COLOR,
  placeholderColorOf,
  placeholderPatch,
  canHoldPlaceholder,
  placeholderPatches,
} from "./placeholder";
