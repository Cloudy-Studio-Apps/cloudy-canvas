import type { Rect } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { POLYGON_DEFAULTS } from "./polygon.defaults";
import type { PolygonElement } from "./polygon.types";

export function createPolygon(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
): PolygonElement {
  return {
    ...createNodeBase("polygon", rect, index, {
      name,
      parentId,
      fills: [solidPaint(POLYGON_DEFAULTS.fill)],
    }),
    pointCount: POLYGON_DEFAULTS.pointCount,
  };
}
