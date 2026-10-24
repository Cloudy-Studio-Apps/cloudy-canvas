import type { CanvasElement } from "@canvas";
import { stickerSourceOf } from "@shared/core";

import { createSticker } from "./sticker.factory";
import type { StickerElement } from "./sticker.types";

/** A sticker copied from a design, as a board sticker in the same place (`pasteForeign`). */
export function pasteForeignSticker(el: CanvasElement, from: string): StickerElement | null {
  const source = from === "board" ? null : stickerSourceOf(el);
  if (!source) return null;
  const center = { x: el.x + el.w / 2, y: el.y + el.h / 2 };
  return {
    ...createSticker(source, center, el.index),
    id: el.id,
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
  };
}
