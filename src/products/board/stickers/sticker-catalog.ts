import { COMMON_STICKERS } from "./common";
import { SEAL_STICKERS } from "./seal";
import type { StickerDef, StickerSection } from "./sticker-catalog.types";

/** The built-in stickers of the picker's Stickers tab (emojis load on their own, see `emoji/`). */
export const STICKER_SECTIONS: readonly StickerSection[] = [
  { id: "seal", label: "Foca watona", stickers: SEAL_STICKERS },
  { id: "common", label: "Common", stickers: COMMON_STICKERS },
];

const BUILT_IN = new Map(
  STICKER_SECTIONS.flatMap((section) => section.stickers).map((sticker) => [sticker.id, sticker]),
);

/** A built-in sticker (seal or common) by id. */
export function builtInSticker(id: string): StickerDef | undefined {
  return BUILT_IN.get(id);
}

/** Whether a sticker matches a search: its label or keywords contain every word of `query`. */
export function matchesSticker(sticker: StickerDef, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = `${sticker.label} ${sticker.keywords.join(" ")}`.toLowerCase();
  return words.every((word) => text.includes(word));
}
