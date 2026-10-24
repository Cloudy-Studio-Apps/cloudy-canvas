import { COMMON_STICKERS } from "./common";
import { SEAL_STICKERS } from "./seal";
import type { BuiltInStickerGroup, StickerDef } from "./sticker-catalog.types";

/** The built-in groups of the picker's Stickers tab, with their stickers (emojis: see `emoji/`). */
export const BUILT_IN_STICKER_GROUPS: readonly BuiltInStickerGroup[] = [
  { id: "seal", label: "Foca watona", order: 10, stickers: SEAL_STICKERS },
  { id: "common", label: "Common", order: 20, stickers: COMMON_STICKERS },
];

/** Whether a sticker matches a search: its label or keywords contain every word of `query`. */
export function matchesSticker(sticker: StickerDef, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = `${sticker.label} ${sticker.keywords.join(" ")}`.toLowerCase();
  return words.every((word) => text.includes(word));
}
