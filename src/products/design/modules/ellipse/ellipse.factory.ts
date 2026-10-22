import type { Rect } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { ELLIPSE_DEFAULTS } from "./ellipse.defaults";
import type { EllipseElement } from "./ellipse.types";

export function createEllipse(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
): EllipseElement {
  return createNodeBase("ellipse", rect, index, {
    name,
    parentId,
    fills: [solidPaint(ELLIPSE_DEFAULTS.fill)],
  });
}
