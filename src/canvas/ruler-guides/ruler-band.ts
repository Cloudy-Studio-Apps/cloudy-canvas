import type { Point } from "../geometry.types";
import type { SnapAxis } from "../snapping";

/** How thick the rulers are, in screen px (the design's, drawn over the canvas's top and left). */
export const RULER_SIZE = 20;

/**
 * Whether a screen point (relative to the canvas) is over the ruler guides of `axis` come out of:
 * the left ruler for vertical ones (`x`), the top one for horizontal ones (`y`).
 */
export function overRuler(axis: SnapAxis, screen: Point): boolean {
  return axis === "x" ? screen.x < RULER_SIZE : screen.y < RULER_SIZE;
}
