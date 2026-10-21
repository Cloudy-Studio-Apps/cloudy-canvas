import type { ElementView } from "@canvas";

import { strokeOutline } from "./stroke.outline";
import type { StrokeElement } from "./stroke.types";

export function drawStroke(view: ElementView, el: StrokeElement): void {
  const outline = strokeOutline(el.points, el.size, true);
  view.graphics.clear();
  if (outline.length >= 6) view.graphics.poly(outline).fill({ color: el.color });
}
