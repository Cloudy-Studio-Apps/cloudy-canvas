// Lines and arrows: one kind (an arrow is a line with an arrowhead cap), the line tool (L, and
// Shift+L for arrows) and the end drag. The module (`line.module.ts`) puts both tools in the
// shapes menu with the line section (caps).
export type * from "./line.types";
export { createLine } from "./line.factory";
export { LINE_DEFAULTS } from "./line.defaults";
export { lineEnds, lineFromEnds, snapTo45 } from "./line-geometry";
export { LineKind } from "./line.kind";
export { LineTool } from "./line.tool";
