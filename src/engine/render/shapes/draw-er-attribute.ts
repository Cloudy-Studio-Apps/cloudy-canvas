import type { Graphics } from "pixi.js";

import {
  ER_ATTRIBUTE_COLOR,
  ER_DOUBLE_GAP,
  ER_FILL_COLOR,
  ER_FONT_SIZE,
  ER_STROKE_WIDTH,
  INK_COLOR,
  type ErAttributeShape,
} from "../../document";
import { ellipseArc } from "../../geo";
import type { ShapeView } from "./shape-view";

const DASH = 5;
const DASH_GAP = 4;
const UNDERLINE_OFFSET = 1;

/**
 * An attribute: an ellipse with its name. Multivalued ones are doubled, derived ones dashed; key
 * attributes are underlined (dashed for a weak entity's partial key).
 */
export function drawErAttribute(view: ShapeView, shape: ErAttributeShape): void {
  const { w, h } = shape;
  const color = ER_ATTRIBUTE_COLOR;
  const g = view.graphics
    .clear()
    .ellipse(w / 2, h / 2, w / 2, h / 2)
    .fill({ color: ER_FILL_COLOR });
  const stroke = { color, width: ER_STROKE_WIDTH };
  if (shape.derived) {
    dashed(g, ellipseArc(w / 2, h / 2, w / 2, h / 2, 0, 2 * Math.PI));
    g.stroke(stroke);
  } else {
    g.ellipse(w / 2, h / 2, w / 2, h / 2).stroke(stroke);
  }
  if (shape.multivalued) {
    const d = ER_DOUBLE_GAP;
    g.ellipse(w / 2, h / 2, w / 2 - d, h / 2 - d).stroke(stroke);
  }

  const text = view.setText(shape.name, { fontSize: ER_FONT_SIZE, color: INK_COLOR });
  const x = (w - text.width) / 2;
  const y = (h - text.height) / 2;
  text.position.set(x, y);
  if (shape.key === "none") return;
  // The text node is measured with 1px of padding on each side; underline the glyphs only.
  const lineY = y + ER_FONT_SIZE * 1.2 + UNDERLINE_OFFSET;
  const line = [x + 1, lineY, x + text.width - 1, lineY];
  if (shape.key === "partial") dashed(g, line, false);
  else g.moveTo(line[0]!, line[1]!).lineTo(line[2]!, line[3]!);
  g.stroke({ color: INK_COLOR, width: 1 });
}

/** Adds a dashed path through the points (closed unless `closed` is false). */
function dashed(g: Graphics, points: readonly number[], closed = true): void {
  const list = closed ? [...points, points[0]!, points[1]!] : [...points];
  let draw = true;
  let left = DASH;
  for (let i = 0; i + 3 < list.length; i += 2) {
    let ax = list[i]!;
    let ay = list[i + 1]!;
    const bx = list[i + 2]!;
    const by = list[i + 3]!;
    let segment = Math.hypot(bx - ax, by - ay);
    while (segment > 0) {
      const step = Math.min(left, segment);
      const t = step / segment;
      const nx = ax + (bx - ax) * t;
      const ny = ay + (by - ay) * t;
      if (draw) g.moveTo(ax, ay).lineTo(nx, ny);
      ax = nx;
      ay = ny;
      segment -= step;
      left -= step;
      if (left <= 1e-6) {
        draw = !draw;
        left = draw ? DASH : DASH_GAP;
      }
    }
  }
}
