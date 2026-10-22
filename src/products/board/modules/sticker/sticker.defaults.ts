import type { StickerDefaults } from "./sticker.types";

export const STICKER_DEFAULTS = {
  size: { w: 96, h: 96 },
} as const satisfies StickerDefaults;
