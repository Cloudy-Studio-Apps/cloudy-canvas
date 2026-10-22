import type { Rect } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { STAR_DEFAULTS } from "./star.defaults";
import type { StarElement } from "./star.types";

export function createStar(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
): StarElement {
  return {
    ...createNodeBase("star", rect, index, {
      name,
      parentId,
      fills: [solidPaint(STAR_DEFAULTS.fill)],
    }),
    pointCount: STAR_DEFAULTS.pointCount,
    innerRadius: STAR_DEFAULTS.innerRadius,
  };
}
