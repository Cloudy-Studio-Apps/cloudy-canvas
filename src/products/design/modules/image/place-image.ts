import type { CanvasEngine, Point } from "@canvas";

import { createImageRectangle } from "./image-rectangle";
import type { PlacedImage } from "./place-image.types";

/**
 * Places a picture on the canvas as a pasted one is: a rectangle filled with it, centered on `at`
 * (a world point) or in the view, as one undo step, and selects it. The picture's bytes are stored
 * in the file under `image.assetId` first when it lacks them, so a library's picture works in a
 * file alone. Returns the new layer's id.
 */
export function placeImage(engine: CanvasEngine, image: PlacedImage, at?: Point): string {
  const { doc } = engine;
  if (!doc.hasAsset(image.assetId)) doc.addAsset(image.assetId, image.bytes);
  const visible = engine.visibleWorldRect();
  const view = at ? { ...visible, x: at.x - visible.w / 2, y: at.y - visible.h / 2 } : visible;
  const el = createImageRectangle(image, view, doc.nextIndex());
  doc.checkpoint();
  doc.batch(() => doc.add(el));
  engine.select([el.id]);
  return el.id;
}
