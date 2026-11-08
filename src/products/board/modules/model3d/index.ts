// 3D models on the board. The module (`model3d.module.ts`) registers the kind, dropping and placing
// model files, the live view, the panel and the agent tools.
export type * from "./model3d.types";
export { convertModelToImage } from "./convert-model";
export { createModel } from "./model3d.factory";
export { Model3dKind } from "./model3d.kind";
