import { nearPolyline } from "../../geometry";
import type { Point } from "../../geometry.types";
import { ElementKind } from "../element.kind";
import { scaleOffsets, scaleRect } from "../element-scale";
import type { ScaleTransform } from "../element-scale.types";
import type { ElementPatch } from "../element.types";
import type { LineElement } from "./line.kind.types";

/** Elements drawn along a polyline: they're hit near the line, not anywhere in their bounds. */
export abstract class LineKind<
  E extends LineElement,
  O extends object = object,
> extends ElementKind<E, O> {
  override readonly scalable: boolean = true;
  /** Extra grab distance beyond half the line width, in world units (thin lines are hard to click). */
  protected readonly reach: number = 0;

  /** Line thickness in world units. */
  protected abstract lineWidth(el: E): number;

  override hitTest(el: E, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance)) return false;
    return nearPolyline(el.points, el, p, this.lineWidth(el) / 2 + tolerance + this.reach);
  }

  /** Its corner, bounds and points scale; subclasses scale their line width too. */
  override scale(el: E, t: ScaleTransform): ElementPatch<E> {
    const { x, y, w, h } = scaleRect(t, el);
    return { x, y, w, h, points: scaleOffsets(t, el.points) } as ElementPatch<E>;
  }
}
