import type { Graphics, StrokeStyle } from "pixi.js";

import { ellipseArc } from "./ellipse-arc";
import { PolygonVariant } from "./geo-variant";

/** Height of the top and bottom ellipses, as a share of the height (capped). */
const CAP = 0.12;
const CAP_MAX = 24;

export class Cylinder extends PolygonVariant {
  readonly id = "cylinder";
  readonly label = "Cylinder";
  readonly defaultSize = { w: 120, h: 140 };

  protected polygon(w: number, h: number): number[] {
    const ry = capRadius(w, h);
    // Top half of the top cap, right side, bottom half of the bottom cap, left side.
    return [
      ...ellipseArc(w / 2, ry, w / 2, ry, Math.PI, 2 * Math.PI),
      ...ellipseArc(w / 2, h - ry, w / 2, ry, 0, Math.PI),
    ];
  }

  /** The visible front edge of the top cap. */
  override decorate(g: Graphics, w: number, h: number, stroke: StrokeStyle): void {
    const ry = capRadius(w, h);
    g.poly(ellipseArc(w / 2, ry, w / 2, ry, 0, Math.PI), false).stroke(stroke);
  }
}

/** Vertical radius of the caps. */
function capRadius(w: number, h: number): number {
  return Math.min(h * CAP, CAP_MAX, w / 2);
}
