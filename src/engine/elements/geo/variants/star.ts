import { PolygonVariant } from "./geo-variant";

/** Inner radius of the star, as a share of the outer one. */
const INNER = 0.4;

/** Five-pointed star filling the box (nudged down so it looks centered). */
export class Star extends PolygonVariant {
  readonly id = "star";
  readonly label = "Star";
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
}
