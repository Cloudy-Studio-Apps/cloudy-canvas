/** What's stamped: the picked sticker and where its picture is stored. */
export interface StickerSource {
  /** The catalog id (`seal:happy`, `emoji:1f44d`, `custom:<id>`, …). */
  sticker: string;
  /** Its name in the picker, for summaries and layer names. */
  label: string;
  /** The document asset holding its picture (`stickerAssetId`). */
  assetId: string;
}

/** The sticker a sticker tool stamps, with its picture's file (stored on first use). */
export interface PickedSticker extends StickerSource {
  data: Uint8Array;
}

/** The sticker tool's options (both products' tools read them). */
export interface StickerToolOptions {
  /** What the sticker tool stamps; `null` until one is picked. */
  sticker: PickedSticker | null;
}
