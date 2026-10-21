import type { Graphics } from "pixi.js";

import type { Point } from "../../geometry.types";

const LENGTH = 9;
const HALF_WIDTH = 4.5;

/** Adds a closed arrowhead at `tip`, pointing away from `from`; fill it afterwards. */
export function drawArrowHead(g: Graphics, from: Point, tip: Point): void {
  const len = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  const ux = (tip.x - from.x) / len;
  const uy = (tip.y - from.y) / len;
  const bx = tip.x - ux * LENGTH;
  const by = tip.y - uy * LENGTH;
  g.poly([
    tip.x,
    tip.y,
    bx - uy * HALF_WIDTH,
    by + ux * HALF_WIDTH,
    bx + uy * HALF_WIDTH,
    by - ux * HALF_WIDTH,
  ]);
}
