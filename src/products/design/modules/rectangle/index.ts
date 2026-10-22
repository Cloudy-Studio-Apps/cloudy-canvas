// Rectangles: the kind (drawn by the core's `BoxDrawTool`, R). The module
// (`rectangle.module.ts`) puts it in the shapes menu.
export type * from "./rectangle.types";
export type * from "./rectangle-options.types";
export { createRectangle } from "./rectangle.factory";
export { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
export { drawRectangle } from "./rectangle.draw";
export { RectangleKind } from "./rectangle.kind";
