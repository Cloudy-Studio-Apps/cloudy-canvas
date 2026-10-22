import type { Point, Rect } from "../geometry.types";
import type { ScaleTransform } from "./element-scale.types";

/** Where a world point goes, to 1/100 of a unit. */
export function scalePoint({ origin, factor }: ScaleTransform, p: Point): Point {
  return {
    x: hundredth(origin.x + (p.x - origin.x) * factor),
    y: hundredth(origin.y + (p.y - origin.y) * factor),
  };
}

/** A rect scaled with its corner (a turned rect stays turned round its new corner). */
export function scaleRect(t: ScaleTransform, rect: Rect): Rect {
  const corner = scalePoint(t, rect);
  return { ...corner, w: scaleLength(t, rect.w), h: scaleLength(t, rect.h) };
}

/** A length (a font size, a stroke weight, a radius), to 1/100 of a unit. */
export function scaleLength({ factor }: ScaleTransform, value: number): number {
  return hundredth(value * factor);
}

/** Points relative to an element's corner (e.g. a line's `points`), scaled with it. */
export function scaleOffsets({ factor }: ScaleTransform, points: readonly number[]): number[] {
  return points.map((value) => hundredth(value * factor));
}

function hundredth(value: number): number {
  return Math.round(value * 100) / 100;
}
