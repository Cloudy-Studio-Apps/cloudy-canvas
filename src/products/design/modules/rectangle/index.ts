// Rectangles: the kind and its tool (R). The module
// (`rectangle.module.ts`) plugs them in with the corner radius section.
export type * from "./rectangle.types";
export type * from "./rectangle-options.types";
export { createRectangle } from "./rectangle.factory";
export { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
export { drawRectangle } from "./rectangle.draw";
export { RectangleKind } from "./rectangle.kind";
export { RectangleTool } from "./rectangle.tool";
