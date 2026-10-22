import { fitInView, type PastedImage, type Rect } from "@canvas";

import { createImage } from "./image.factory";
import { IMAGE_DEFAULTS } from "./image.defaults";
import type { ImageElement } from "./image.types";

/**
 * An image pasted from outside the app, centered in `view` at its pixel size, shrunk to fit the
 * view when it's larger.
 */
export function createPastedImage(image: PastedImage, view: Rect, index: string): ImageElement {
  const size = { w: image.width, h: image.height };
  return createImage(image.assetId, fitInView(size, view, IMAGE_DEFAULTS.fitInView), index);
}
