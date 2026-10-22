// Frames: the kind (a container that shows its name at the top of the page; drawn by the core's
// `BoxDrawTool`, F) and the size presets. The module (`frame.module.ts`) plugs them in with the frame section.
export type * from "./frame.types";
export type * from "./frame-options.types";
export { createFrame } from "./frame.factory";
export { FRAME_DEFAULTS } from "./frame.defaults";
export { FRAME_PRESETS, presetSize } from "./frame-presets";
export { FrameKind } from "./frame.kind";
