// Stickers, shared by every product: the catalog (`catalog/`: the seal moods, the common stamps
// and the emojis), the app-level registry plugins add groups and stickers to (`stickerCatalog`),
// the pictures' asset ids and the picked sticker both products' sticker tools stamp.
export type * from "./catalog";
export type * from "./sticker-pick.types";
export type * from "./sticker-registry.types";
export {
  COMMON_STICKERS,
  fetchStickerBytes,
  matchesSticker,
  SEAL_STICKERS,
  STICKER_GRID,
  stickerSvg,
  svgDataUrl,
} from "./catalog";
export { stickerAssetId } from "./sticker-asset";
export { findStampableSticker } from "./stampable-sticker";
export { stickerSourceOf } from "./sticker-source";
export { pickSticker, stickerPicture } from "./sticker-pictures";
export { StickerRegistry, stickerCatalog } from "./sticker-registry";
