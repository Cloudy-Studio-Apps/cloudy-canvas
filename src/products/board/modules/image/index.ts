// Pictures pasted or dropped on the board. The module (`image.module.ts`) registers the kind,
// pasting images and the image panel.
export type * from "./image.types";
export type * from "./image-options.types";
export { createImage } from "./image.factory";
export { createPastedImage } from "./pasted-image";
export { ImageKind } from "./image.kind";
export { IMAGE_DEFAULTS } from "./image.defaults";
