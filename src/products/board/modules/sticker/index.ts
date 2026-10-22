// Stickers: stamped reactions. The catalog (`catalog/`: the seal moods, the common stamps and the
// emojis) is what the picker and agents offer. The module (`sticker.module.ts`) registers the
// kind, the tool (K), its picker and the agent tools.
export type * from "./sticker.types";
export type * from "./sticker-options.types";
export type * from "./catalog";
export * from "./catalog";
export { createSticker } from "./sticker.factory";
export { stickerAssetId } from "./sticker-asset";
export { StickerKind } from "./sticker.kind";
export { STICKER_DEFAULTS } from "./sticker.defaults";
export { StickerTool } from "./sticker.tool";
export { stickerTools } from "./sticker.agent-tools";
