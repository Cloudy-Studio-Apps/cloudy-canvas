import type { ElementDefaults } from "@canvas";

import type { DesignNode, VectorNetwork } from "../core";

/**
 * A vector: a network of vertices and bezier segments (local coordinates, starting at 0, 0),
 * whose closed regions are filled and whose segments are stroked. Drawn with the pencil or the
 * pen, or converted from a shape when its points are edited.
 */
export interface VectorElement extends DesignNode {
  type: "vector";
  network: VectorNetwork;
}

export interface VectorDefaults extends ElementDefaults {
  stroke: string;
  strokeWeight: number;
  /** How much the pencil smooths a line, in screen pixels. */
  smoothing: number;
  /** Extra grab distance around thin lines, in world units at 100%. */
  reach: number;
}
