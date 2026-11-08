// 3D models on designs. The module (`model3d.module.ts`) registers the kind, dropping and placing
// model files, the live view, the panel and the agent tools.
export type * from "./model3d.types";
export { convertModelToRectangle } from "./convert-model";
export { createModelNode } from "./model3d.factory";
export { ModelNodeKind } from "./model3d.kind";
