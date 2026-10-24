import { stickerCatalog, type StickerSection } from "@shared/core";

/** Every sticker group agents can stamp: the built-in and plugins' ones, then the emojis. */
export async function stickerSections(): Promise<readonly StickerSection[]> {
  await stickerCatalog.loadEmojis();
  return [...stickerCatalog.sections("stickers"), ...stickerCatalog.sections("emojis")];
}
