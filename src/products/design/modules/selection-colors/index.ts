// Selection colors: every color the selection and what it holds paint with, each one changed
// everywhere at once. The module (`selection-colors.module.ts`) adds the properties panel section.
export type * from "./selection-colors.types";
export { collectSelectionColors } from "./collect-selection-colors";
export { nodeColorPaths } from "./node-color-paths";
export { paintColorPaths } from "./paint-color-paths";
export { recolorPatches } from "./recolor-patches";
