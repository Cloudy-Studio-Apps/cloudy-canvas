import type { ElementSide, Point } from "@canvas";

import { PolygonVariant } from "./geo.variant";

/** Inner radius of the star, as a share of the outer one. */
const INNER = 0.4;

/** Five-pointed star filling the box (nudged down so it looks centered). */
export class Star extends PolygonVariant {
  readonly id = "star";
  readonly label = "Star";
  readonly icon = "M10 2.5l2.2 4.6l5 .7l-3.6 3.5l.9 5L10 13.9l-4.5 2.4l.9-5l-3.6-3.5l5-.7z";
  readonly defaultSize = { w: 130, h: 130 };

  protected polygon(w: number, h: number): number[] {
    const points: number[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 1 : INNER;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push(
        w / 2 + (w / 2) * r * Math.cos(a),
        h / 2 + (h / 2) * r * Math.sin(a) * 1.05 + h * 0.03,
      );
    }
    return points;
  }

  override sideAnchor(w: number, h: number, side: ElementSide): Point {
    switch (side) {
      case "top":
        return { x: w / 2, y: 0 };
      // The notch between the two lower points.
      case "bottom":
        return { x: w / 2, y: h * 0.74 };
      case "left":
        return { x: w * 0.03, y: h * 0.37 };
      case "right":
        return { x: w * 0.97, y: h * 0.37 };
    }
  }
}
