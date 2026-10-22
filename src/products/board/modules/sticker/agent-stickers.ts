import { STICKER_SECTIONS, type StickerDef, type StickerSection } from "./catalog";

/** Every sticker set agents can stamp: the built-in ones, then the emojis (loaded on first use). */
export async function stickerSections(): Promise<readonly StickerSection[]> {
  const { EMOJI_SECTIONS } = await import("./catalog/emoji");
  return [...STICKER_SECTIONS, ...EMOJI_SECTIONS];
}

/** A sticker by catalog id. The user's own (`custom:`) stickers live outside the board. */
export async function findSticker(id: string): Promise<StickerDef> {
  if (id.startsWith("custom:")) {
    throw new Error(`"${id}" is one of the user's own stickers, which agents can't stamp.`);
  }
  for (const section of await stickerSections()) {
    const found = section.stickers.find((sticker) => sticker.id === id);
    if (found) return found;
  }
  throw new Error(`No sticker "${id}". Find ids with list_stickers.`);
}
