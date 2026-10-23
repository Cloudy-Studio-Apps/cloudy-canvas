import type { Point } from "@canvas";

import { createNodeBase, NODE_DEFAULTS, solidPaint } from "../core";
import { LINE_DEFAULTS } from "./line.defaults";
import { lineFromEnds } from "./line-geometry";
import type { LineCap, LineNodeElement } from "./line.types";

export function createLine(
  start: Point,
  end: Point,
  name: string,
  index: string,
  parentId: string | null,
  endCap: LineCap,
): LineNodeElement {
  const { points, ...rect } = lineFromEnds(start, end);
  return {
    ...createNodeBase("line", rect, index, { name, parentId }),
    strokes: [solidPaint(LINE_DEFAULTS.stroke)],
    strokeWeight: NODE_DEFAULTS.strokeWeight,
    strokeAlign: "center",
    points,
    startCap: "none",
    endCap,
  };
}
