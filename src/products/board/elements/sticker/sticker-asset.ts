/**
 * The document asset id of a sticker's picture. Unlike other assets it isn't a fresh `createId()`:
 * it's derived from the sticker's catalog id, so every placement (and pastes from other boards)
 * share one copy of the picture.
 */
export function stickerAssetId(stickerId: string): string {
  return `sticker:${stickerId}`;
}
