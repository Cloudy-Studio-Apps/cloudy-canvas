import type { Point } from "../geometry.types";

/**
 * A uniform scale round a fixed world point (the Scale tool, K): every point `q` goes to
 * `origin + factor × (q − origin)`, and every length is multiplied by `factor`.
 */
export interface ScaleTransform {
  origin: Point;
  factor: number;
}
