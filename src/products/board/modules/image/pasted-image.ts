import { rectCenter, roundRect, type PastedImage, type Rect } from "@canvas";

import { createImage } from "./image.factory";
import { IMAGE_DEFAULTS } from "./image.defaults";
import type { ImageElement } from "./image.types";

/**
 * An image pasted from outside the app, centered in `view` at its pixel size, shrunk to fit the
 * view when it's larger.
 */
export function createPastedImage(image: PastedImage, view: Rect, index: string): ImageElement {
  const fit = IMAGE_DEFAULTS.fitInView;
  const scale = Math.min(1, (view.w * fit) / image.width, (view.h * fit) / image.height);
  const w = Math.max(1, image.width * scale);
  const h = Math.max(1, image.height * scale);
  const center = rectCenter(view);
  const rect = roundRect({ x: center.x - w / 2, y: center.y - h / 2, w, h });
  return createImage(image.assetId, rect, index);
}
