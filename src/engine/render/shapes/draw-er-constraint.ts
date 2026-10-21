import {
  ER_STROKE_WIDTH,
  INK_COLOR,
  MUTED_INK_COLOR,
  type ErConstraintShape,
} from "../../document";
import { drawArrowHead } from "./arrow-head";
import type { ShapeView } from "./shape-view";

const LABEL_FONT_SIZE = 11;
const LABEL_OFFSET = 10;

/**
 * A constraint between relations, from its resolved `points`: a line between diamonds (exclusion),
 * an arrow (inclusion), an arc round an entity (exclusive), or an arrowed arc with its cardinality
 * (inclusive).
 */
export function drawErConstraint(view: ShapeView, shape: ErConstraintShape): void {
  const { points } = shape;
  const g = view.graphics.clear();
  const keep = new Set<string>();
  if (points.length >= 4) {
    g.moveTo(points[0]!, points[1]!);
    for (let i = 2; i + 1 < points.length; i += 2) g.lineTo(points[i]!, points[i + 1]!);
    g.stroke({ color: INK_COLOR, width: ER_STROKE_WIDTH });
    const n = points.length;
    if (shape.rule === "inclusion" || shape.rule === "inclusive") {
      drawArrowHead(
        g,
        { x: points[n - 4]!, y: points[n - 3]! },
        { x: points[n - 2]!, y: points[n - 1]! },
      );
      g.fill({ color: INK_COLOR });
    }
    if (shape.rule === "inclusive" && (shape.min || shape.max)) {
      keep.add("label");
      const mid = Math.floor(n / 4) * 2;
      const label = view.setTextSlot("label", `(${shape.min || "0"},${shape.max || "n"})`, {
        fontSize: LABEL_FONT_SIZE,
        color: MUTED_INK_COLOR,
      });
      label.position.set(points[mid]! + LABEL_OFFSET, points[mid + 1]! - label.height / 2);
    }
  }
  view.pruneTextSlots(keep);
}
