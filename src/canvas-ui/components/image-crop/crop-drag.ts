import {
  clampCrop,
  cropInside,
  cropTransform,
  imageQuad,
  panTransform,
  reframeTransform,
  rotatePoint,
  transformCrop,
  zoomTransform,
  type ImageTransform,
  type Point,
  type Rect,
} from "@canvas";

import type { CropDrag, CropEdge, CropGrip, ImageCropValue } from "./image-crop-overlay.types";

/** The smallest the crop box gets, in world units. */
const MIN_SIZE = 1;
/** The smallest share of its size the picture scales down to in one drag. */
const MIN_FACTOR = 0.01;

/**
 * The element's box and picture after `drag` of `grip`: the picture moves (`pan`), scales round
 * the opposite corner or its middle (`zoom`), or a side of the box moves and the picture stays
 * (`edge`). With `clamp`, nothing past the picture's edges shows; `null` when a step can't.
 */
export function dragCrop(grip: CropGrip, drag: CropDrag): ImageCropValue | null {
  const { start } = drag;
  const { w, h } = start.frame;
  if (grip.kind === "pan") {
    const delta = { x: (drag.to.x - drag.from.x) / w, y: (drag.to.y - drag.from.y) / h };
    return within({ ...start, transform: panTransform(start.transform, delta) }, drag.clamp);
  }
  if (grip.kind === "zoom") {
    const quad = imageQuad(start.transform).map((p) => ({ x: p.x * w, y: p.y * h }));
    const corner = quad[grip.corner]!;
    const anchor = drag.fromCenter ? middle(quad) : quad[(grip.corner + 2) % 4]!;
    const along = { x: corner.x - anchor.x, y: corner.y - anchor.y };
    const length = along.x * along.x + along.y * along.y;
    if (length === 0) return null;
    const moved = { x: drag.to.x - anchor.x, y: drag.to.y - anchor.y };
    const factor = Math.max(MIN_FACTOR, (moved.x * along.x + moved.y * along.y) / length);
    const about = { x: anchor.x / w, y: anchor.y / h };
    return within(
      { ...start, transform: zoomTransform(start.transform, factor, about) },
      drag.clamp,
    );
  }
  return resizeBox(grip.edge, drag);
}

function resizeBox({ x: ex, y: ey }: CropEdge, drag: CropDrag): ImageCropValue | null {
  const { start, to } = drag;
  const { frame } = start;
  const before: Rect = { x: 0, y: 0, w: frame.w, h: frame.h };
  // Sides can't pass the picture's edges when clamped.
  const limit = drag.clamp ? pictureRect(start.transform, before) : null;
  let left = 0;
  let top = 0;
  let right = frame.w;
  let bottom = frame.h;
  if (ex === -1) left = Math.min(Math.max(to.x, limit?.x ?? -Infinity), right - MIN_SIZE);
  if (ex === 1) right = Math.max(Math.min(to.x, limit ? limit.x + limit.w : Infinity), MIN_SIZE);
  if (ey === -1) top = Math.min(Math.max(to.y, limit?.y ?? -Infinity), bottom - MIN_SIZE);
  if (ey === 1) bottom = Math.max(Math.min(to.y, limit ? limit.y + limit.h : Infinity), MIN_SIZE);
  if (drag.keepRatio && ex !== 0 && ey !== 0) {
    // The height follows the width, from the corner opposite the dragged one.
    const height = ((right - left) * frame.h) / Math.max(frame.w, 1e-9);
    if (ey === -1) top = bottom - height;
    else bottom = top + height;
  }
  const after: Rect = { x: left, y: top, w: right - left, h: bottom - top };
  // Mirrored, the box's corner is on the right of what it draws.
  const boxX = frame.mirrored ? frame.w - right : left;
  const corner = rotatePoint({ x: frame.x + boxX, y: frame.y + after.y }, frame, frame.rotation);
  const value: ImageCropValue = {
    frame: { ...frame, x: corner.x, y: corner.y, w: after.w, h: after.h },
    transform: reframeTransform(start.transform, before, after),
  };
  return drag.clamp && !insidePicture(value.transform) ? null : value;
}

/** The picture's box in the element's frame (world units), for a picture neither turned nor mirrored. */
function pictureRect(transform: ImageTransform, box: Rect): Rect | null {
  const crop = transformCrop(transform);
  if (!crop) return null;
  const w = box.w / crop.w;
  const h = box.h / crop.h;
  return { x: -crop.x * w, y: -crop.y * h, w, h };
}

/** `value`, its crop moved back inside the picture when `clamp` (`null` when it's too big). */
function within(value: ImageCropValue, clamp: boolean): ImageCropValue | null {
  if (!clamp) return value;
  const crop = transformCrop(value.transform);
  if (!crop || crop.w > 1 + 1e-6 || crop.h > 1 + 1e-6) return null;
  return { ...value, transform: cropTransform(clampCrop(crop)) };
}

function insidePicture(transform: ImageTransform): boolean {
  const crop = transformCrop(transform);
  return crop !== null && cropInside(crop);
}

function middle(points: readonly Point[]): Point {
  const sum = points.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}
