import type { ElementDefaults, Size } from "@canvas";

import type { DesignNode } from "../core";

/** A regular polygon (a triangle by default) stretched to its box. */
export interface PolygonElement extends DesignNode {
  type: "polygon";
  /** Number of sides, 3 or more. */
  pointCount: number;
}

export interface PolygonDefaults extends ElementDefaults {
  size: Size;
  fill: string;
  pointCount: number;
  minPoints: number;
  maxPoints: number;
}
