import type { Point } from "../../geometry.types";
import type { ErShapes } from "../lang";
import type { Centers } from "./layout.types";

/** Space between the parent and the top of the triangle. */
const ISA_GAP = 30;

/**
 * Places hierarchy triangles that aren't in `centers` yet: under the parent, centered over its
 * children, or above the children when the parent isn't placed.
 */
export function placeIsas(shapes: ErShapes, centers: Centers): void {
  const byId = new Map(shapes.entities.map((e) => [e.id, e]));
  for (const isa of shapes.isas) {
    if (centers.has(isa.id)) continue;
    const parent = centers.get(isa.parentId);
    const children = isa.children
      .map((child) => centers.get(child.entityId))
      .filter((p): p is Point => p !== undefined);
    const childX = children.length ? average(children.map((p) => p.x)) : undefined;
    if (parent) {
      const half = (byId.get(isa.parentId)?.h ?? 0) / 2;
      // Over the children when they sit right under the parent, else straight under the parent.
      const x = childX !== undefined && Math.abs(childX - parent.x) < 40 ? childX : parent.x;
      centers.set(isa.id, { x, y: parent.y + half + ISA_GAP + isa.h / 2 });
    } else if (childX !== undefined) {
      const top = Math.min(...children.map((p) => p.y));
      centers.set(isa.id, { x: childX, y: top - ISA_GAP * 2 - isa.h });
    }
  }
}

function average(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
