import type { ElementDefaults, Size } from "@canvas";

import type { DesignNode } from "../core";

/** A star stretched to its box. */
export interface StarElement extends DesignNode {
  type: "star";
  /** Number of points, 3 or more. */
  pointCount: number;
  /** The inner corners' distance from the center, as a fraction of the outer ones' (0–1). */
  innerRadius: number;
}

export interface StarDefaults extends ElementDefaults {
  size: Size;
  fill: string;
  pointCount: number;
  innerRadius: number;
  minPoints: number;
  maxPoints: number;
}
