import type { ElementSide, Point } from "@canvas";

import { PolygonVariant } from "./geo.variant";

/** Slant, as a share of the width. */
const SKEW = 0.2;

export class Parallelogram extends PolygonVariant {
  readonly id = "parallelogram";
  readonly label = "Parallelogram";
  readonly icon = "M6 5h12l-4 10H2z";
  readonly defaultSize = { w: 170, h: 100 };

  protected polygon(w: number, h: number): number[] {
    const skew = w * SKEW;
    return [skew, 0, w, 0, w - skew, h, 0, h];
  }

  override sideAnchor(w: number, h: number, side: ElementSide): Point {
    const skew = (w * SKEW) / 2;
    if (side === "left") return { x: skew, y: h / 2 };
    if (side === "right") return { x: w - skew, y: h / 2 };
    return super.sideAnchor(w, h, side);
  }
}
