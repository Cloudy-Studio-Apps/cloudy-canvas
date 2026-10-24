import type { BoxSides, StrokeAlign } from "@canvas";

import type { StrokeCap, StrokeJoin } from "../node/design-node.types";

/** What a stroke style holds: a stroke's settings, not its paints. */
export interface StrokeStyleValue {
  strokeWeight: number;
  /** Each side's weight, for kinds that keep them apart; `null`: every side has `strokeWeight`. */
  strokeWeights: BoxSides | null;
  strokeAlign: StrokeAlign;
  strokeCap: StrokeCap;
  strokeJoin: StrokeJoin;
  strokeMiterAngle: number;
  strokeDashes: number[];
}
