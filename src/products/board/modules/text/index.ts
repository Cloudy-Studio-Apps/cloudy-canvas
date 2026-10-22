// Free text labels sized to their text. The module (`text.module.ts`) registers the kind, the
// tool (T) and pasting text.
export type * from "./text.types";
export { createTextDraft } from "./text.factory";
export { TextKind } from "./text.kind";
export { TEXT_DEFAULTS } from "./text.defaults";
export { createPastedText } from "./pasted-text";
export { TextTool } from "./text.tool";
