// Text: the kind (in any installed or Google font, auto width / auto height / fixed), its tool
// (T) and its layout. The module (`text.module.ts`) adds the Typography section.
export type * from "./text.types";
export type * from "./text-options.types";
export { createText } from "./text.factory";
export { TEXT_DEFAULTS } from "./text.defaults";
export { fontOf, textSize, textStyleOf } from "./text-layout";
export { retypeset } from "./retypeset";
export { TextKind } from "./text.kind";
export { TextTool } from "./text.tool";
