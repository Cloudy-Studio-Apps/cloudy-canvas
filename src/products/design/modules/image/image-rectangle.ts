import { rectCenter, roundRect, type PastedImage, type Rect } from "@canvas";

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
  const scale = Math.min(
    1,
    (view.w * FIT_IN_VIEW) / image.width,
    (view.h * FIT_IN_VIEW) / image.height,
  );
  const w = Math.max(1, image.width * scale);
  const h = Math.max(1, image.height * scale);
  const center = rectCenter(view);
  const rect = roundRect({ x: center.x - w / 2, y: center.y - h / 2, w, h });
  return {
    ...createRectangle(rect, "Image", index, null, "#000000"),
    fills: [imagePaint(image.assetId)],
  };
}
