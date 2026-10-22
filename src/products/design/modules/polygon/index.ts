// Polygons: the kind, its tool and its corners. The module (`polygon.module.ts`) puts the tool in
// the shapes menu with the polygon section (number of sides).
export type * from "./polygon.types";
export { createPolygon } from "./polygon.factory";
export { POLYGON_DEFAULTS } from "./polygon.defaults";
export { PolygonKind } from "./polygon.kind";
export { polygonPoints } from "./polygon-points";
export { PolygonTool } from "./polygon.tool";
