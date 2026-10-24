// Text: the kind (in any installed or Google font, auto width / auto height / fixed), its tool
// (T) and its layout. The module (`text.module.ts`) adds the Typography section.
export type * from "./text.types";
export type * from "./text-options.types";
export { createText } from "./text.factory";
export { TEXT_DEFAULTS } from "./text.defaults";
export { fontOf, textLayout, textSize, textStyleOf } from "./text-layout";
export { rangeStyleValue, textStyleValue } from "./text-range-style";
export { retypeset } from "./retypeset";
export {
  applyRunStyle,
  RUN_STYLE_PREFIX,
  runStylePatch,
  runStyleIds,
  unstyledRangePatch,
} from "./apply-run-style";
export { syncRunStyleBindings } from "./run-style-bindings";
export { faceFromName } from "./text-face-name";
export type { FaceFromName } from "./text-face-name.types";
export { TextKind } from "./text.kind";
export { isText } from "./is-text";
export { TextTool } from "./text.tool";
export {
  readTextStyle,
  TEXT_STYLE,
  TEXT_STYLE_PATH,
  textStyleSummary,
  textStyleOfNode,
} from "./text-style";
