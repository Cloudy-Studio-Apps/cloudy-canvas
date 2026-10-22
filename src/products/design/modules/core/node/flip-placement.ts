import { normalizeAngle, rotatePoint, type Point } from "@canvas";

import type { DesignNode } from "./design-node.types";
import type { FlipAxis } from "./flip.types";

/**
 * Where a node lands mirrored across the line `at` (x = at for `x`, y = at for `y`): its corner is
 * the mirror of its far one (top-right, or bottom-left) and its turn goes the other way. What it
 * draws isn't mirrored; kinds whose content isn't symmetric mirror that themselves.
 */
export function flipPlacement(
  node: DesignNode,
  axis: FlipAxis,
  at: number,
): Pick<DesignNode, "x" | "y" | "rotation"> {
  const turn = node.rotation ?? 0;
  const far = axis === "x" ? { x: node.x + node.w, y: node.y } : { x: node.x, y: node.y + node.h };
  const corner = mirrorPoint(rotatePoint(far, node, turn), axis, at);
  return { x: hundredth(corner.x), y: hundredth(corner.y), rotation: normalizeAngle(-turn) };
}

/** A point mirrored across the line `at` on `axis`. */
export function mirrorPoint(p: Point, axis: FlipAxis, at: number): Point {
  return axis === "x" ? { x: 2 * at - p.x, y: p.y } : { x: p.x, y: 2 * at - p.y };
}

function hundredth(value: number): number {
  return Math.round(value * 100) / 100;
}
