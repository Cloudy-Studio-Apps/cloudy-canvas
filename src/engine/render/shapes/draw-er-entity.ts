import {
  ER_DOUBLE_GAP,
  ER_FILL_COLOR,
  ER_FONT_SIZE,
  ER_STROKE_WIDTH,
  INK_COLOR,
  type ErEntityShape,
} from "../../document";
import type { ShapeView } from "./shape-view";

/** An entity: a rectangle with its name, doubled when the entity is weak. */
export function drawErEntity(view: ShapeView, shape: ErEntityShape): void {
  const { w, h, color } = shape;
  const g = view.graphics.clear().rect(0, 0, w, h).fill({ color: ER_FILL_COLOR });
  g.rect(0, 0, w, h).stroke({ color, width: ER_STROKE_WIDTH, alignment: 1 });
  if (shape.weak) {
    const d = ER_DOUBLE_GAP;
    g.rect(d, d, w - d * 2, h - d * 2).stroke({ color, width: ER_STROKE_WIDTH, alignment: 1 });
  }
  const text = view.setText(shape.name, {
    fontSize: ER_FONT_SIZE,
    color: INK_COLOR,
    fontWeight: "600",
  });
  text.position.set((w - text.width) / 2, (h - text.height) / 2);
}
