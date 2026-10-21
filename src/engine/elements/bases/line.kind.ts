import { distanceToSegmentSq } from "../../geometry";
import type { Point } from "../../geometry.types";
import { ElementKind } from "../element.kind";
import type { LineElement } from "./line.kind.types";

/** Elements drawn along a polyline: they're hit near the line, not anywhere in their bounds. */
export abstract class LineKind<E extends LineElement> extends ElementKind<E> {
  /** Extra grab distance beyond half the line width, in world units (thin lines are hard to click). */
  protected readonly reach: number = 0;

  /** Line thickness in world units. */
  protected abstract lineWidth(el: E): number;

  override hitTest(el: E, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance)) return false;
    const { points } = el;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const radius = this.lineWidth(el) / 2 + tolerance + this.reach;
    const radiusSq = radius * radius;
    if (points.length === 2) {
      return distanceToSegmentSq(local, points[0]!, points[1]!, points[0]!, points[1]!) <= radiusSq;
    }
    for (let i = 0; i + 3 < points.length; i += 2) {
      const distance = distanceToSegmentSq(
        local,
        points[i]!,
        points[i + 1]!,
        points[i + 2]!,
        points[i + 3]!,
      );
      if (distance <= radiusSq) return true;
    }
    return false;
  }
}
