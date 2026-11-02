import type { ElementView } from "@canvas";

import { STROKE_DEFAULTS } from "./stroke.defaults";
import { strokeCenterLine, strokeOutline } from "./stroke.outline";
import type { StrokeElement } from "./stroke.types";

/**
 * A pen is a thick line. A highlighter stays a filled outline: translucent, a line would show
 * darker where it overlaps itself.
 */
export function drawStroke(view: ElementView, el: StrokeElement): void {
  view.graphics.clear();
  if (el.pen === "pen") {
    const line = strokeCenterLine(el.points, el.size, true, el.pen);
    if (line.length < 4) return;
    view.graphics
      .poly(line, false)
      .stroke({ color: el.color, width: el.size, cap: "round", join: "round" });
    return;
  }
  const outline = strokeOutline(el.points, el.size, true, el.pen);
  if (outline.length < 6) return;
  view.graphics.poly(outline).fill({ color: el.color, alpha: STROKE_DEFAULTS.pens[el.pen].alpha });
}
