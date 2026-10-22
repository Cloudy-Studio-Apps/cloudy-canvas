import type { ElementView } from "@canvas";

import { STROKE_DEFAULTS } from "./stroke.defaults";
import { strokeOutline } from "./stroke.outline";
import type { StrokeElement } from "./stroke.types";

export function drawStroke(view: ElementView, el: StrokeElement): void {
  const outline = strokeOutline(el.points, el.size, true, el.pen);
  view.graphics.clear();
  if (outline.length < 6) return;
  view.graphics.poly(outline).fill({ color: el.color, alpha: STROKE_DEFAULTS.pens[el.pen].alpha });
}
