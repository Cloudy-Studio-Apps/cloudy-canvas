import type { Rect } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import type { RectangleElement } from "./rectangle.types";

export function createRectangle(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
  fill: string,
): RectangleElement {
  return {
    ...createNodeBase("rectangle", rect, index, { name, parentId, fills: [solidPaint(fill)] }),
    cornerRadius: RECTANGLE_DEFAULTS.cornerRadius,
  };
}
