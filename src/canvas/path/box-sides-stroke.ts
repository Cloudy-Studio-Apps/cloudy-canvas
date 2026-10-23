import { booleanPaths } from "./boolean-paths";
import type { BoxSides, PathShape, StrokeAlign } from "./path.types";
import { rectPath } from "./rect-path";

/**
 * The area a box's stroke covers when each side has its own weight (Figma's individual strokes):
 * the band between the box grown and shrunk by each side's share of its weight (`align`: all of
 * it inside, half each way, or all outside), the corners rounded from `radius`.
 */
export function boxSidesStroke(
  w: number,
  h: number,
  radius: number,
  sides: BoxSides,
  align: StrokeAlign,
): PathShape {
  const outer = align === "inside" ? 0 : align === "center" ? 0.5 : 1;
  const inner = 1 - outer;
  const grow = (share: number, sign: number) => ({
    x: -sign * share * sides.left,
    y: -sign * share * sides.top,
    w: w + sign * share * (sides.left + sides.right),
    h: h + sign * share * (sides.top + sides.bottom),
  });
  const most = Math.max(sides.top, sides.right, sides.bottom, sides.left);
  const outside = rectPath(grow(outer, 1), radius > 0 ? radius + outer * most : 0);
  const within = rectPath(grow(inner, -1), Math.max(0, radius - inner * most));
  if (outside.contours.length === 0) return { contours: [] };
  return booleanPaths("subtract", [
    { shape: outside, fillRule: "nonzero" },
    { shape: within, fillRule: "nonzero" },
  ]);
}
