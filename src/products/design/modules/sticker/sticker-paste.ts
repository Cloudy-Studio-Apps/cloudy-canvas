import type { CanvasElement } from "@canvas";
import { stickerSourceOf } from "@shared/core";

import { createStickerNode } from "./sticker.factory";
import type { StickerNodeElement } from "./sticker.types";

/** A sticker copied from a board, as a design sticker in the same place (`pasteForeign`). */
export function pasteForeignSticker(el: CanvasElement, from: string): StickerNodeElement | null {
  const source = from === "design" ? null : stickerSourceOf(el);
  if (!source) return null;
  const rect = { x: el.x, y: el.y, w: el.w, h: el.h };
  return { ...createStickerNode(source, rect, el.index, null), id: el.id };
}
