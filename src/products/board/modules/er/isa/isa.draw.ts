import type { ElementView } from "@canvas";

import { ER_FILL_COLOR, INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import { erNotation } from "../base/er-notation";
import type { ErIsaElement } from "./isa.types";

/**
 * A hierarchy: a triangle pointing down from the parent to the children, or, in a notation with
 * `isa: circle`, a circle with "d" (disjoint) or "o" (overlapping), or Silberschatz's hollow arrow
 * up to the parent. (The total mark and the exclusive arc go with the lines: the arc has to reach
 * every child's line.)
 */
export function drawErIsa(view: ElementView, shape: ErIsaElement): void {
  const look = erNotation(shape.notation).isa;
  if (look === "circle") {
    drawCircle(view, shape);
    return;
  }
  if (look === "arrow") {
    drawArrow(view, shape);
    return;
  }
  view.pruneTextSlots(new Set());
  const { w, h } = shape;
  view.graphics
    .clear()
    .poly([0, 0, w, 0, w / 2, h])
    .fill({ color: ER_FILL_COLOR })
    .poly([0, 0, w, 0, w / 2, h])
    .stroke({ color: INK_COLOR, width: ER_DEFAULTS.strokeWidth, join: "miter" });
}

function drawCircle(view: ElementView, shape: ErIsaElement): void {
  const { w, h } = shape;
  const radius = Math.min(w, h) / 2;
  view.graphics
    .clear()
    .circle(w / 2, h / 2, radius)
    .fill({ color: ER_FILL_COLOR })
    .stroke({ color: INK_COLOR, width: ER_DEFAULTS.strokeWidth });
  const letter = view.setTextSlot("kind", shape.exclusive ? "d" : "o", {
    fontSize: ER_DEFAULTS.fontSize,
    color: INK_COLOR,
    fontWeight: "600",
  });
  letter.position.set((w - letter.width) / 2, (h - letter.height) / 2);
  view.pruneTextSlots(new Set(["kind"]));
}

/** Silberschatz's specialization: a hollow arrowhead up to the parent, "disjoint" when exclusive. */
function drawArrow(view: ElementView, shape: ErIsaElement): void {
  const { w, h } = shape;
  const points = [w / 2, 0, w, h, 0, h];
  view.graphics
    .clear()
    .poly(points)
    .fill({ color: ER_FILL_COLOR })
    .poly(points)
    .stroke({ color: INK_COLOR, width: ER_DEFAULTS.strokeWidth, join: "miter" });
  if (!shape.exclusive) {
    view.pruneTextSlots(new Set());
    return;
  }
  const label = view.setTextSlot("kind", "disjoint", { fontSize: 11, color: INK_COLOR });
  label.position.set(w + 6, (h - label.height) / 2);
  view.pruneTextSlots(new Set(["kind"]));
}
