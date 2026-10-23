// Paths: outlines made of cubic curves (`PathShape`), and what's done with them: booleans and
// normalizing (Clipper2, with the curves rebuilt from where the result's points came from),
// stroke outlines, bounds, hit tests, placement and drawing with real holes.
export type * from "./path.types";
export {
  bendThrough,
  flatness,
  flatten,
  nearestT,
  pointAt,
  reverseCurve,
  splitAt,
  subCurve,
} from "./bezier";
export { curveExtent } from "./curve-extent";
export { curveOf, isLine, lineTo, samePoint } from "./path-segments";
export { booleanPaths, normalizePath } from "./boolean-paths";
export { outlineStroke } from "./outline-stroke";
export { dashPath } from "./dash-path";
export { strokeArea } from "./stroke-area";
export { rectPath } from "./rect-path";
export { boxSidesStroke } from "./box-sides-stroke";
export { pathBounds } from "./path-bounds";
export { distanceToPath, pointInPath } from "./path-hit";
export { localPath, mapPath, mirrorPath, placePath } from "./transform-path";
export { fillPath, strokePath, traceContour } from "./trace-path";
export { FLATTEN_TOLERANCE } from "./path-precision";
