// Gradients every product can paint with: the data, its handles, color math and CSS.
export type * from "./gradient.types";
export type * from "./gradient-color.types";
export {
  affineFromPoints,
  applyAffine,
  IDENTITY_TRANSFORM,
  invertAffine,
  multiplyAffine,
} from "./affine";
export { cssColor, parseCssColor } from "./css-color";
export { hexToRgba, oklabToSrgb, rgbaToHex, srgbToOklab } from "./gradient-color";
export { gradientCss } from "./gradient-css";
export { gradientKey } from "./gradient-key";
export { gradientParam } from "./gradient-param";
export { gradientRamp, RAMP_SIZE } from "./gradient-ramp";
export {
  addStop,
  easeStop,
  MIN_STOPS,
  mixColors,
  removeStop,
  reverseStops,
  sampleStops,
  sortStops,
} from "./gradient-stops";
export {
  defaultGradientTransform,
  flipGradient,
  gradientHandles,
  pointAlong,
  rotateGradient90,
  screenLength,
  squareWidth,
  transformFromHandles,
} from "./gradient-transforms";
export { withEase, withInterpolation } from "./gradient-options";
export { parseCssGradient } from "./parse-css-gradient";
