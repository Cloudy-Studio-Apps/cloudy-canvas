import { fetchStickerBytes, type StickerDef, type StickerLook } from "./catalog";
import { stickerAssetId } from "./sticker-asset";
import type { PickedSticker } from "./sticker-pick.types";

/** Pictures already made, by asset id (a sticker's file never changes under the same id). */
const pictures = new Map<string, Promise<Uint8Array>>();

/** A sticker's picture file, drawn with `look` when given (stickers with `restyle` only). */
export function stickerPicture(
  sticker: StickerDef,
  look?: StickerLook | null,
): Promise<Uint8Array> {
  const key = stickerAssetId(sticker.id, look);
  let picture = pictures.get(key);
  if (!picture) {
    picture =
      look && sticker.restyle
        ? Promise.resolve(new TextEncoder().encode(sticker.restyle(look)))
        : fetchStickerBytes(sticker.url);
    pictures.set(key, picture);
    picture.catch(() => pictures.delete(key));
  }
  return picture;
}

/** What a sticker tool stamps for `sticker` (its picture loaded). */
export async function pickSticker(
  sticker: StickerDef,
  look?: StickerLook | null,
): Promise<PickedSticker> {
  const usedLook = look && sticker.restyle ? look : null;
  return {
    sticker: sticker.id,
    label: sticker.label,
    assetId: stickerAssetId(sticker.id, usedLook),
    data: await stickerPicture(sticker, usedLook),
  };
}
