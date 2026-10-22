import type { ElementView } from "@canvas";
import type { Graphics } from "pixi.js";

import { drawPaints } from "../core";
import { LINE_DEFAULTS } from "./line.defaults";
import type { LineCap, LineNodeElement } from "./line.types";

/** Half the angle between an arrowhead's sides. */
const ARROW_SPREAD = Math.PI / 6;

/** The line's strokes along it, with arrowheads on its arrow ends. */
export function drawLine(view: ElementView, el: LineNodeElement): void {
  const [x0, y0, x1, y1] = el.points;
  const head = Math.max(LINE_DEFAULTS.arrow.min, el.strokeWeight * LINE_DEFAULTS.arrow.perWeight);
  drawPaints(view, el, (g) => {
    g.moveTo(x0, y0).lineTo(x1, y1);
    traceCap(g, el.startCap, x0, y0, x1, y1, head);
    traceCap(g, el.endCap, x1, y1, x0, y0, head);
  });
}

/** An open arrowhead at (tipX, tipY), pointing away from (fromX, fromY). */
function traceCap(
  g: Graphics,
  cap: LineCap,
  tipX: number,
  tipY: number,
  fromX: number,
  fromY: number,
  length: number,
): void {
  if (cap !== "arrow") return;
  const angle = Math.atan2(tipY - fromY, tipX - fromX);
  for (const side of [-1, 1]) {
    const a = angle + Math.PI + side * ARROW_SPREAD;
    g.moveTo(tipX, tipY).lineTo(tipX + Math.cos(a) * length, tipY + Math.sin(a) * length);
  }
}
