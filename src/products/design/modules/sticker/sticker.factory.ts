import type { Point, Rect } from "@canvas";
import type { StickerSource } from "@shared/core";

import { createNodeBase } from "../core";
import { STICKER_NODE_DEFAULTS } from "./sticker.defaults";
import type { StickerNodeElement } from "./sticker.types";

/** A sticker node showing `source`'s picture, named after it. */
export function createStickerNode(
  source: StickerSource,
  rect: Rect,
  index: string,
  parentId: string | null,
): StickerNodeElement {
  return {
    ...createNodeBase("sticker", rect, index, { name: source.label, parentId }),
    sticker: source.sticker,
    label: source.label,
    assetId: source.assetId,
    edgeColor: null,
    outline: null,
  };
}

/** A sticker's box of `size` (the default one when missing), centered on `center`. */
export function stickerRect(center: Point, size?: number): Rect {
  const w = size ?? STICKER_NODE_DEFAULTS.size.w;
  const h = size ?? STICKER_NODE_DEFAULTS.size.h;
  return { x: Math.round(center.x - w / 2), y: Math.round(center.y - h / 2), w, h };
}
