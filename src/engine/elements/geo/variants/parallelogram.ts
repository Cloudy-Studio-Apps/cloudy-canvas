import { PolygonVariant } from "./geo-variant";

/** Slant, as a share of the width. */
const SKEW = 0.2;

export class Parallelogram extends PolygonVariant {
  readonly id = "parallelogram";
  readonly label = "Parallelogram";
  readonly defaultSize = { w: 170, h: 100 };

  protected polygon(w: number, h: number): number[] {
    const skew = w * SKEW;
    return [skew, 0, w, 0, w - skew, h, 0, h];
  }
}
