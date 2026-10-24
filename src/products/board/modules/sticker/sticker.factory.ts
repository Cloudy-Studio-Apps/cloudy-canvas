import { createElementBase, type Point } from "@canvas";

import { STICKER_DEFAULTS } from "./sticker.defaults";
import type { StickerSource } from "@shared/core";

import type { StickerElement } from "./sticker.types";

/** A sticker of the default size, centered on `center`. */
export function createSticker(source: StickerSource, center: Point, index: string): StickerElement {
  const { w, h } = STICKER_DEFAULTS.size;
  const rect = { x: Math.round(center.x - w / 2), y: Math.round(center.y - h / 2), w, h };
  return {
    ...createElementBase("sticker", rect, index),
    assetId: source.assetId,
    sticker: source.sticker,
    label: source.label,
  };
}
