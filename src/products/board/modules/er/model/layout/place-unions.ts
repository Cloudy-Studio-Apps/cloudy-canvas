import type { Point } from "@canvas";

import type { ErShapes } from "../lang";
import type { Centers } from "./layout.types";

/**
 * Places union circles that aren't in `centers` yet: halfway between the category and the middle
 * of its superclasses (or next to whichever of them is placed).
 */
export function placeUnions(shapes: ErShapes, centers: Centers): void {
  for (const union of shapes.unions) {
    if (centers.has(union.id)) continue;
    const category = centers.get(union.categoryId);
    const supers = union.superclassIds
      .map((id) => centers.get(id))
      .filter((p): p is Point => p !== undefined);
    const middle = supers.length
      ? { x: average(supers.map((p) => p.x)), y: average(supers.map((p) => p.y)) }
      : undefined;
    if (category && middle) {
      centers.set(union.id, { x: (category.x + middle.x) / 2, y: (category.y + middle.y) / 2 });
    } else if (category) {
      centers.set(union.id, { x: category.x, y: category.y - 90 });
    } else if (middle) {
      centers.set(union.id, { x: middle.x, y: middle.y + 90 });
    }
  }
}

function average(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
