import type { ElementView, Point, Rect } from "@canvas";

import { BoxShapeKind, drawPaints } from "../core";
import { ELLIPSE_DEFAULTS } from "./ellipse.defaults";
import { createEllipse } from "./ellipse.factory";
import type { EllipseElement } from "./ellipse.types";

/** Ellipses and circles, hit inside their outline only. */
export class EllipseKind extends BoxShapeKind<EllipseElement> {
  readonly type = "ellipse";
  readonly label = "Ellipse";
  readonly description = "An ellipse or, with Shift, a circle.";
  override readonly tool = "ellipse";
  override readonly defaults = ELLIPSE_DEFAULTS;

  createNode(rect: Rect, name: string, index: string, parentId: string | null): EllipseElement {
    return createEllipse(rect, name, index, parentId);
  }

  draw(view: ElementView, el: EllipseElement): void {
    drawPaints(view, el, (g) => g.ellipse(el.w / 2, el.h / 2, el.w / 2, el.h / 2));
  }

  override hitTest(el: EllipseElement, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance)) return false;
    const rx = el.w / 2 + tolerance;
    const ry = el.h / 2 + tolerance;
    const dx = (p.x - (el.x + el.w / 2)) / Math.max(rx, 1);
    const dy = (p.y - (el.y + el.h / 2)) / Math.max(ry, 1);
    return dx * dx + dy * dy <= 1;
  }
}
