import type { ElementView } from "@canvas";

import { IMAGE_BACKGROUND_COLOR, PAPER_SHADOW_COLOR } from "../../palette";
import type { ImageElement } from "./image.types";

export function drawImage(view: ElementView, el: ImageElement): void {
  const g = view.graphics.clear();
  if (el.background === "white") {
    g.rect(0, 0, el.w, el.h)
      .fill({ color: IMAGE_BACKGROUND_COLOR })
      .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.08, width: 1, alignment: 1 });
  }
  const p = el.padding;
  view.placeImage(
    el.assetId,
    { x: p, y: p, w: el.w - p * 2, h: el.h - p * 2 },
    el.crop ?? "contain",
  );
}
