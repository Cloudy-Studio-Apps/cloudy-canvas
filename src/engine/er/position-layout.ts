import type { ErShape } from "../document";
import type { Point, Rect } from "../geometry.types";
import { unionRects } from "../geometry";
import type { Centers } from "./layout";
import { boxAt } from "./layout/box";

/** Top-left positions for shapes laid out by center, moved so the layout's top-left is `origin`. */
export function placeAt(
  shapes: readonly ErShape[],
  centers: Centers,
  origin: Point,
): Map<string, Point> {
  const bounds = layoutBounds(shapes, centers);
  const dx = bounds ? origin.x - bounds.x : 0;
  const dy = bounds ? origin.y - bounds.y : 0;
  const result = new Map<string, Point>();
  for (const shape of shapes) {
    const center = centers.get(shape.id);
    if (!center) continue;
    result.set(shape.id, {
      x: Math.round(center.x - shape.w / 2 + dx),
      y: Math.round(center.y - shape.h / 2 + dy),
    });
  }
  return result;
}

/** Top-left positions straight from the centers, without moving the layout. */
export function topLefts(shapes: readonly ErShape[], centers: Centers): Map<string, Point> {
  const result = new Map<string, Point>();
  for (const shape of shapes) {
    const center = centers.get(shape.id);
    if (center) {
      result.set(shape.id, {
        x: Math.round(center.x - shape.w / 2),
        y: Math.round(center.y - shape.h / 2),
      });
    }
  }
  return result;
}

export function centersOf(shapes: readonly ErShape[]): Centers {
  return new Map(shapes.map((s) => [s.id, { x: s.x + s.w / 2, y: s.y + s.h / 2 }]));
}

function layoutBounds(shapes: readonly ErShape[], centers: Centers): Rect | null {
  return unionRects(
    shapes.flatMap((shape) => {
      const center = centers.get(shape.id);
      return center ? [boxAt(center, shape)] : [];
    }),
  );
}
