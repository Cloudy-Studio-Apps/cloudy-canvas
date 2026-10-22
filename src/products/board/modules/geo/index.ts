// Shapes: one kind whose outline comes from its variant (`variants/`, registered at runtime).
// The module (`geo.module.ts`) registers the kind, the shape tool (R) and its panel.
export type * from "./geo.types";
export type * from "./geo-options.types";
export { createGeo } from "./geo.factory";
export { GeoKind } from "./geo.kind";
export { GEO_DEFAULTS } from "./geo.defaults";
export { GeoVariant, geoVariants, PolygonVariant, variantOf } from "./variants";
export { ellipseArc } from "./variants/ellipse-arc";
export { ShapeTool } from "./shape.tool";
