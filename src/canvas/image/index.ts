// How a picture sits in its layer: fitted, cropped (Figma's image transform) or tiled.
export type * from "./gif";
export type * from "./image-transform.types";
export type * from "./placeholder-svg.types";
export {
  clampCrop,
  coverCrop,
  cropInside,
  cropTransform,
  fitTransform,
  imageQuad,
  panTransform,
  reframeTransform,
  rotateTransform90,
  transformCrop,
  zoomTransform,
} from "./image-transform";
export { GifPlayer, isAnimatedGif, parseAnimatedGif } from "./gif";
export { imageHeaderSize } from "./image-header-size";
export { imageType } from "./image-type";
export { placeholderInk } from "./placeholder-ink";
export { placeholderSvg } from "./placeholder-svg";
