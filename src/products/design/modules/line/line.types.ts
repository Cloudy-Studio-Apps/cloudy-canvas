import type { ElementDefaults, Point, Size } from "@canvas";

import type { DesignNode } from "../core";

/** How a line's end looks. */
export type LineCap = "none" | "arrow";

/**
 * A straight line (an arrow with an `arrow` cap). Its bounds wrap its two ends, and `points`
 * holds them relative to (x, y), so moving the node moves the line. It shows only its strokes.
 */
export interface LineNodeElement extends DesignNode {
  type: "line";
  /** `[x0, y0, x1, y1]`: the start and end, relative to (x, y). */
  points: [number, number, number, number];
  startCap: LineCap;
  endCap: LineCap;
}

/** A line's two ends in world coordinates. */
export interface LineEnds {
  start: Point;
  end: Point;
}

export interface LineDefaults extends ElementDefaults {
  /** A line placed with a click: its width is its length (it's horizontal). */
  size: Size;
  stroke: string;
  /** Arrowhead length per unit of stroke weight, and its smallest length. */
  arrow: { perWeight: number; min: number };
  /** Extra grab distance around thin lines, in world units at 100%. */
  reach: number;
}
