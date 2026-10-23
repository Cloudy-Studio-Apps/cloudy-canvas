import type { ElementTextStyle, ElementView } from "@canvas";

import { ER_DEFAULTS } from "../base/er.defaults";
import { ER_FILL_COLOR, INK_COLOR, MUTED_INK_COLOR } from "../../../palette";
import type { ErRelationElement } from "./relation.types";
import { cardinalityRatio } from "./cardinality-ratio";
import { erNotation } from "../base/er-notation";

const RATIO_FONT_SIZE = 12;

/**
 * A relation: a diamond with its name, doubled when identifying, inside a rectangle when it's an
 * associative entity, and its 1:N / N:M label off its upper-left edge, clear of lines that leave
 * from the corners.
 */
export function drawErRelation(
  view: ElementView,
  shape: ErRelationElement,
  textStyle: ElementTextStyle,
): void {
  const { w, h, color } = shape;
  const diamond = (inset: number) => {
    // The inner diamond's corners move in by the inset along each axis, scaled to the slope.
    const ix = (inset * Math.hypot(w, h)) / h;
    const iy = (inset * Math.hypot(w, h)) / w;
    return [w / 2, iy, w - ix, h / 2, w / 2, h - iy, ix, h / 2];
  };
  const g = view.graphics.clear();
  // An associative entity: a rectangle round the diamond.
  if (shape.associative) {
    g.rect(0, 0, w, h)
      .fill({ color: ER_FILL_COLOR })
      .stroke({ color, width: ER_DEFAULTS.strokeWidth, join: "miter" });
  }
  g.poly(diamond(0)).fill({ color: ER_FILL_COLOR });
  g.poly(diamond(0)).stroke({ color, width: ER_DEFAULTS.strokeWidth, join: "miter" });
  if (shape.identifying) {
    g.poly(diamond(ER_DEFAULTS.doubleGap)).stroke({
      color,
      width: ER_DEFAULTS.strokeWidth,
      join: "miter",
    });
  }
  const marks = erNotation(shape.notation).dependency === "marks";
  const mark = marks ? dependencyLetter(shape) : "";
  if (mark) {
    // A dependency (by identification, or by existence): a bar across the top corner with its
    // letter above it.
    const y = h * 0.28;
    const half = (w / 2) * (y / (h / 2));
    g.moveTo(w / 2 - half, y)
      .lineTo(w / 2 + half, y)
      .stroke({ color, width: ER_DEFAULTS.strokeWidth });
  }
  view.placeText(shape.name, textStyle, w, h);

  // With Chen's letters on the lines the diamond doesn't repeat them.
  const ratio = erNotation(shape.notation).cardinality === "ratio" ? "" : cardinalityRatio(shape);
  const keep = new Set<string>();
  if (mark) {
    keep.add("id");
    const letter = view.setTextSlot("id", mark, {
      fontSize: 10,
      color: INK_COLOR,
      fontWeight: "600",
    });
    letter.position.set((w - letter.width) / 2, h * 0.28 - letter.height);
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

/** "I" for dependency by identification, "E" by existence ("I E" for both, which Check reports). */
function dependencyLetter(shape: ErRelationElement): string {
  if (shape.idMark && shape.existenceMark) return "I E";
  return shape.idMark ? "I" : shape.existenceMark ? "E" : "";
}
