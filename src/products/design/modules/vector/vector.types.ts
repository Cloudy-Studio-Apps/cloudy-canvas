import type { ElementDefaults } from "@canvas";

import type { DesignNode } from "../core";

/** A freehand line (drawn with the pencil): `points` is a flat list relative to (x, y). */
export interface VectorElement extends DesignNode {
  type: "vector";
  points: number[];
}

export interface VectorDefaults extends ElementDefaults {
  stroke: string;
  strokeWeight: number;
  /** How much the pencil smooths a line, in screen pixels. */
  smoothing: number;
  /** Extra grab distance around thin lines, in world units at 100%. */
  reach: number;
}
