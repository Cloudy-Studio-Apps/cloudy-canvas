// Everything that can be on the canvas. Each element type is a folder (data type, factory, drawer
// and its `ElementKind`) registered at runtime in `elementKinds` (`element.registry.ts`), so plugins
// can add types the rest of the engine has never heard of.
export type * from "./element.types";
export type * from "./element.kind.types";
export type * from "./element.info.types";
export type * from "./bases";
export type * from "./geo";
export type * from "./sticky";
export type * from "./stroke";
export { ElementKind } from "./element.kind";
export { elementKinds, isElement, kindOf } from "./element.registry";
export { ELEMENT_DEFAULTS } from "./element.defaults";
export { BoxKind, LineKind, TextBoxKind } from "./bases";
export { createElementBase } from "./element.factory";
export { elementInfo } from "./element.info";
export {
  createGeo,
  GEO_DEFAULTS,
  GeoKind,
  GeoVariant,
  geoVariants,
  PolygonVariant,
  variantOf,
} from "./geo";
export { createSticky, STICKY_DEFAULTS, StickyKind } from "./sticky";
export { createStroke, StrokeKind, strokeOutline } from "./stroke";
