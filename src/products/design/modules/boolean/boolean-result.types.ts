import type { Point } from "@canvas";

import type { NodeGeometry } from "../core";

/** A boolean's result relative to its first operand: its geometry, corner and size. */
export interface BooleanResult {
  geometry: NodeGeometry;
  corner: Point;
  w: number;
  h: number;
}
