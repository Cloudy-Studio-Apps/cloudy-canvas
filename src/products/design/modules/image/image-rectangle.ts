import { fitInView, type PastedImage, type Rect } from "@canvas";

import { imagePaint } from "../core";
import { createRectangle, type RectangleElement } from "../rectangle";

/** How much of the view a large pasted image may cover. */
const FIT_IN_VIEW = 0.8;

/**
 * A pasted or dropped image, as Figma makes it: a rectangle named "Image" filled with it, at its
 * pixel size (shrunk to fit the view), centered in `view`.
 */
export function createImageRectangle(
  image: PastedImage,
  view: Rect,
  index: string,
): RectangleElement {
  const rect = fitInView({ w: image.width, h: image.height }, view, FIT_IN_VIEW);
  return createRectangle(rect, "Image", index, null, [imagePaint(image.assetId)]);
}
