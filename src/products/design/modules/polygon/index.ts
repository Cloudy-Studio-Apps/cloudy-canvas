// Polygons: the kind (a `PointsShapeKind`, drawn by the core's `BoxDrawTool`). The module
// (`polygon.module.ts`) puts it in the shapes menu with the polygon section (sides).
export type * from "./polygon.types";
export { createPolygon } from "./polygon.factory";
export { POLYGON_DEFAULTS } from "./polygon.defaults";
export { PolygonKind } from "./polygon.kind";
