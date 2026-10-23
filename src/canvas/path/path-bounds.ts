import type { Rect } from "../geometry.types";
import { curveExtent } from "./curve-extent";
import type { PathShape } from "./path.types";
import { curveOf } from "./path-segments";

/** The axis-aligned box round a shape (exact for its curves), or `null` when it's empty. */
export function pathBounds(shape: PathShape): Rect | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const contour of shape.contours) {
    let from = contour.start;
    minX = Math.min(minX, from.x);
    minY = Math.min(minY, from.y);
    maxX = Math.max(maxX, from.x);
    maxY = Math.max(maxY, from.y);
    for (const segment of contour.segments) {
      const box = curveExtent(curveOf(from, segment));
      minX = Math.min(minX, box.minX);
      minY = Math.min(minY, box.minY);
      maxX = Math.max(maxX, box.maxX);
      maxY = Math.max(maxY, box.maxY);
      from = segment.to;
    }
  }
  return minX === Infinity ? null : { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
