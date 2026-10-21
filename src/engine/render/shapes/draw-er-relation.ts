import {
  ER_DOUBLE_GAP,
  ER_FILL_COLOR,
  ER_FONT_SIZE,
  ER_STROKE_WIDTH,
  INK_COLOR,
  MUTED_INK_COLOR,
  type ErRelationShape,
} from "../../document";
import { cardinalityRatio } from "../../er";
import type { ShapeView } from "./shape-view";

const RATIO_FONT_SIZE = 12;

/**
 * A relation: a diamond with its name, doubled when identifying, and its 1:N / N:M label off its
 * upper-left edge, clear of lines that leave from the corners.
 */
export function drawErRelation(view: ShapeView, shape: ErRelationShape): void {
  const { w, h, color } = shape;
  const diamond = (inset: number) => {
    // The inner diamond's corners move in by the inset along each axis, scaled to the slope.
    const ix = (inset * Math.hypot(w, h)) / h;
    const iy = (inset * Math.hypot(w, h)) / w;
    return [w / 2, iy, w - ix, h / 2, w / 2, h - iy, ix, h / 2];
  };
  const g = view.graphics.clear().poly(diamond(0)).fill({ color: ER_FILL_COLOR });
  g.poly(diamond(0)).stroke({ color, width: ER_STROKE_WIDTH, join: "miter" });
  if (shape.identifying) {
    g.poly(diamond(ER_DOUBLE_GAP)).stroke({ color, width: ER_STROKE_WIDTH, join: "miter" });
  }
  if (shape.idMark) {
    // Dependency by identification: a bar across the top corner with an "I" above it.
    const y = h * 0.28;
    const half = (w / 2) * (y / (h / 2));
    g.moveTo(w / 2 - half, y)
      .lineTo(w / 2 + half, y)
      .stroke({ color, width: ER_STROKE_WIDTH });
  }
  const text = view.setText(shape.name, { fontSize: ER_FONT_SIZE, color: INK_COLOR });
  text.position.set((w - text.width) / 2, (h - text.height) / 2);

  const ratio = cardinalityRatio(shape);
  const keep = new Set<string>();
  if (shape.idMark) {
    keep.add("id");
    const mark = view.setTextSlot("id", "I", { fontSize: 10, color: INK_COLOR, fontWeight: "600" });
    mark.position.set((w - mark.width) / 2, h * 0.28 - mark.height);
  }
  if (ratio) {
    keep.add("ratio");
    const label = view.setTextSlot("ratio", ratio, {
      fontSize: RATIO_FONT_SIZE,
      color: MUTED_INK_COLOR,
      fontWeight: "600",
    });
    label.position.set(w / 4 - label.width - 2, h / 4 - label.height - 2);
  }
  view.pruneTextSlots(keep);
}
