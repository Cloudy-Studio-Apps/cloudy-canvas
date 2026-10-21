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
import { LOLLIPOP_SIZE } from "../../er/er-size";
import { ellipseArc } from "../../geo";
import { dashed } from "./dashed-path";
import type { ShapeView } from "./shape-view";

const UNDERLINE_OFFSET = 1;

/**
 * An attribute. In the Chen look, an ellipse with its name: doubled when multivalued, dashed when
 * derived, the name underlined for keys (dashed for a weak entity's partial key). In the lollipop
 * look, a small circle with the name above: filled for keys, half-filled when optional.
 */
export function drawErAttribute(view: ShapeView, shape: ErAttributeShape): void {
  if (shape.look === "lollipop") drawLollipop(view, shape);
  else drawEllipse(view, shape);
}

function drawEllipse(view: ShapeView, shape: ErAttributeShape): void {
  const { w, h } = shape;
  const g = view.graphics
    .clear()
    .ellipse(w / 2, h / 2, w / 2, h / 2)
    .fill({ color: ER_FILL_COLOR });
  outline(g, w / 2, h / 2, w / 2, h / 2, shape);
  const text = view.setText(shape.name, { fontSize: ER_FONT_SIZE, color: INK_COLOR });
  const x = (w - text.width) / 2;
  const y = (h - text.height) / 2;
  text.position.set(x, y);
  underline(g, shape, x, y, text.width);
}

function drawLollipop(view: ShapeView, shape: ErAttributeShape): void {
  const { w, h } = shape;
  const r = LOLLIPOP_SIZE / 2;
  const cx = w / 2;
  const cy = h - r;
  const g = view.graphics.clear().circle(cx, cy, r).fill({ color: ER_FILL_COLOR });
  if (shape.key === "pk") g.circle(cx, cy, r).fill({ color: INK_COLOR });
  else if (shape.optional) {
    g.moveTo(cx - r, cy)
      .arc(cx, cy, r, Math.PI, 0, true)
      .closePath()
      .fill({ color: INK_COLOR });
  }
  outline(g, cx, cy, r, r, shape);
  const text = view.setText(shape.name, { fontSize: ER_FONT_SIZE, color: INK_COLOR });
  const x = (w - text.width) / 2;
  text.position.set(x, 0);
  if (shape.key === "partial") underline(g, shape, x, 0, text.width);
}

/** The ellipse or circle: dashed when derived, doubled when multivalued. */
function outline(
  g: Graphics,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  shape: ErAttributeShape,
): void {
  const stroke = { color: ER_ATTRIBUTE_COLOR, width: ER_STROKE_WIDTH };
  if (shape.derived) dashed(g, ellipseArc(cx, cy, rx, ry, 0, 2 * Math.PI));
  else g.ellipse(cx, cy, rx, ry);
  g.stroke(stroke);
  if (shape.multivalued) {
    const d = Math.min(ER_DOUBLE_GAP, rx / 3);
    g.ellipse(cx, cy, rx - d, ry - d).stroke(stroke);
  }
}

/** Key attributes are underlined; a weak entity's partial key is underlined with dashes. */
function underline(g: Graphics, shape: ErAttributeShape, x: number, y: number, width: number) {
  if (shape.key === "none") return;
  // The text node is measured with 1px of padding on each side; underline the glyphs only.
  const lineY = y + ER_FONT_SIZE * 1.2 + UNDERLINE_OFFSET;
  const line = [x + 1, lineY, x + width - 1, lineY];
  if (shape.key === "partial") dashed(g, line, false);
  else g.moveTo(line[0]!, line[1]!).lineTo(line[2]!, line[3]!);
  g.stroke({ color: INK_COLOR, width: 1 });
}
