import type { StickerLook } from "./catalog";

/**
 * The document asset id of a sticker's picture. Unlike other assets it isn't a fresh `createId()`:
 * it's derived from the sticker's catalog id (and its edge color when changed), so every placement
 * (and pastes from other files) share one copy of the picture.
 */
export function stickerAssetId(stickerId: string, look?: StickerLook | null): string {
  const base = `sticker:${stickerId}`;
  return look ? `${base}~edge=${look.edgeColor.replace("#", "").toLowerCase()}` : base;
}
