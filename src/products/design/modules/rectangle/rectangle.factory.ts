import type { Rect } from "@canvas";

import { createNodeBase, type Paint } from "../core";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import type { RectangleElement } from "./rectangle.types";

export function createRectangle(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
  fills: Paint[],
): RectangleElement {
  return {
    ...createNodeBase("rectangle", rect, index, { name, parentId, fills }),
    cornerRadius: RECTANGLE_DEFAULTS.cornerRadius,
  };
}
