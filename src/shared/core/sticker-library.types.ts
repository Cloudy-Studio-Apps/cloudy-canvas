/** A picture the user imported to stamp as a sticker. */
export interface CustomSticker {
  id: string;
  name: string;
  /** Its media type (`image/png`, `image/svg+xml`, …). */
  type: string;
  addedAt: string;
}

/** An image file picked to import as a sticker. */
export interface StickerImage {
  name: string;
  type: string;
  data: Uint8Array;
}

/**
 * The user's own stickers, kept by the app (not in any board: stamping one copies its picture into
 * the board). Implemented per platform in `platform/`.
 */
export interface StickerLibrary {
  /** Oldest first. */
  list(): Promise<CustomSticker[]>;
  read(id: string): Promise<Uint8Array>;
  add(image: StickerImage): Promise<CustomSticker>;
  remove(id: string): Promise<void>;
}
