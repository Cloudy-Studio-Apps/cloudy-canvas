import type { CanvasElement, ElementDefaults, Size } from "@canvas";

export type { PickedSticker, StickerSource } from "@shared/core";

export interface StickerElement extends CanvasElement {
  type: "sticker";
  /** The document asset holding its picture (shared by every placement of the same sticker). */
  assetId: string;
  /** The catalog id it was picked from (`seal:happy`, `emoji:1f44d`, `custom:<id>`, …). */
  sticker: string;
  /** Its name in the picker, for summaries. */
  label: string;
}

export interface StickerDefaults extends ElementDefaults {
  /** A placed sticker's size, in world units. */
  size: Size;
}
