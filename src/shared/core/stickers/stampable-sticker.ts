import type { StickerDef } from "./catalog";
import { stickerCatalog } from "./sticker-registry";

/**
 * A sticker agents can stamp, by catalog id (built-in, a plugin's or an emoji). The user's own
 * (`custom:`) stickers live outside the catalog, so agents can't. Throws with a message for them.
 */
export async function findStampableSticker(id: string): Promise<StickerDef> {
  if (id.startsWith("custom:")) {
    throw new Error(`"${id}" is one of the user's own stickers, which agents can't stamp.`);
  }
  const found = await stickerCatalog.find(id);
  if (!found) throw new Error(`No sticker "${id}". Find ids with list_stickers.`);
  return found;
}
