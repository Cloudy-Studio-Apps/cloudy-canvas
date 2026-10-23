import type { Graphics } from "pixi.js";
import type { Point } from "@canvas";

import type { CrowFoot, CrowFootStyle } from "./er-links.types";

/** How far the fork's prongs spread at the entity, and where they meet along the line. */
const FORK_HALF_WIDTH = 6;
const FORK_LENGTH = 12;
/** Where the one bar crosses the line, from the entity. */
const ONE_AT = 6;
/** Where the min mark sits, from the entity, past the max mark. */
const MIN_AT = 18;
const BAR_HALF = 6;
const CIRCLE_RADIUS = 3.5;

/**
 * Crow's-foot marks at `end` (on the entity's outline) of a line coming from `before`: the max
 * mark next to the entity (a bar or a fork), then the min mark (a circle or a bar). Strokes them.
 */
export function drawCrowFoot(
  g: Graphics,
  before: Point,
  end: Point,
  foot: CrowFoot,
  style: CrowFootStyle,
): void {
  const len = Math.hypot(end.x - before.x, end.y - before.y) || 1;
  const ux = (end.x - before.x) / len;
  const uy = (end.y - before.y) / len;
  const at = (back: number, across: number): Point => ({
    x: end.x - ux * back - uy * across,
    y: end.y - uy * back + ux * across,
  });
  const bar = (back: number) => {
    const a = at(back, BAR_HALF);
    const b = at(back, -BAR_HALF);
    g.moveTo(a.x, a.y).lineTo(b.x, b.y);
  };

  if (foot.max === "many") {
    const tip = at(FORK_LENGTH, 0);
    for (const across of [FORK_HALF_WIDTH, -FORK_HALF_WIDTH]) {
      const prong = at(0, across);
      g.moveTo(tip.x, tip.y).lineTo(prong.x, prong.y);
    }
  } else {
    bar(ONE_AT);
  }
  if (foot.min === "one") bar(MIN_AT);
  g.stroke({ color: style.color, width: style.width });
  if (foot.min === "zero") {
    const c = at(MIN_AT + CIRCLE_RADIUS, 0);
    g.circle(c.x, c.y, CIRCLE_RADIUS)
      .fill({ color: style.fill })
      .stroke({ color: style.color, width: style.width });
  }
}
