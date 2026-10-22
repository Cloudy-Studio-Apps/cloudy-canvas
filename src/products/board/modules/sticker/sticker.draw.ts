import type { ElementView } from "@canvas";

import type { StickerElement } from "./sticker.types";

export function drawSticker(view: ElementView, el: StickerElement): void {
  view.graphics.clear();
  view.placeImage(el.assetId, { x: 0, y: 0, w: el.w, h: el.h });
}
