// Stickers on the board: stamped reactions. The catalog and the picker are shared with the design
// (`@shared/core` stickers, `@canvas-ui` StickerWheel). The module (`sticker.module.ts`) registers
// the kind, the tool (K), its picker and the agent tools.
export type * from "./sticker.types";
export type * from "./sticker-options.types";
export { createSticker } from "./sticker.factory";
export { StickerKind } from "./sticker.kind";
export { STICKER_DEFAULTS } from "./sticker.defaults";
export { StickerTool } from "./sticker.tool";
export { stickerTools } from "./sticker.agent-tools";
