import type { StickerNodeDefaults } from "./sticker.types";

export const STICKER_NODE_DEFAULTS = {
  size: { w: 96, h: 96 },
  outline: { color: "#2A2F37", width: 4, visible: true },
} as const satisfies StickerNodeDefaults;
