// Vectors: freehand lines drawn with the pencil (Shift+P). The module (`vector.module.ts`) puts
// the pencil on the toolbar.
export type * from "./vector.types";
export { createVector, createVectorLine } from "./vector.factory";
export { VECTOR_DEFAULTS } from "./vector.defaults";
export { VectorKind } from "./vector.kind";
export { PencilTool } from "./pencil.tool";
export * from "./edit";
