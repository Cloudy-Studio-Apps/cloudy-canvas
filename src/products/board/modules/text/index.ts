// Free text labels sized to their text. The module (`text.module.ts`) registers the kind, the
// tool (T), its options panel and pasting text.
export type * from "./text.types";
export { createTextDraft } from "./text.factory";
export { TextKind } from "./text.kind";
export { TEXT_ALIGNS, TEXT_BOLD_WEIGHT, TEXT_DEFAULTS } from "./text.defaults";
export { fitLabel, labelStyle, measureLabel } from "./text-measure";
export { clampFontSize, isBold, restyleText, textLookOf, textOptionsOf } from "./text-options";
export { createPastedText } from "./pasted-text";
export { TextTool } from "./text.tool";
