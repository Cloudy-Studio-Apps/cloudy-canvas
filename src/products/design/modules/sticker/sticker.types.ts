import type { ElementDefaults, Size } from "@canvas";

import type { DesignNode } from "../core";

/** A border round a sticker that follows its shape (its picture's outline). */
export interface StickerOutline {
  /** `#RRGGBB`. */
  color: string;
  /** In world units. */
  width: number;
  visible: boolean;
}

/**
 * A sticker stamped on a design: the picked sticker's picture (a document asset shared by every
 * stamp of it with this edge color), kept in proportion. Its paints are its picture; its own look
 * is the die-cut edge's color (built-in stickers) and an outline.
 */
export interface StickerNodeElement extends DesignNode {
  type: "sticker";
  /** The catalog id it was picked from (`seal:happy`, `emoji:1f44d`, `custom:<id>`, …). */
  sticker: string;
  /** Its name in the picker. */
  label: string;
  /** The document asset showing it (`stickerAssetId(sticker, edge)`). */
  assetId: string;
  /** The die-cut edge's color; `null` draws it as the sticker comes (white). */
  edgeColor: string | null;
  outline: StickerOutline | null;
}

export interface StickerNodeDefaults extends ElementDefaults {
  /** A stamped sticker's size, in world units. */
  size: Size;
  /** The outline a sticker gets when one is added. */
  outline: StickerOutline;
}
