import type { ElementView } from "@canvas";

import { ER_FILL_COLOR, INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import type { ErIsaElement } from "./isa.types";

/** Extra reach of the exclusive arc beyond the triangle on each side. */
const ARC_REACH = 10;

/**
 * A hierarchy: a triangle pointing down from the parent to the children, with an arc under it when
 * the specialization is exclusive. (The total mark sits on the parent's line, drawn with the lines.)
 */
export function drawErIsa(view: ElementView, shape: ErIsaElement): void {
  const { w, h } = shape;
  const g = view.graphics
    .clear()
    .poly([0, 0, w, 0, w / 2, h])
    .fill({ color: ER_FILL_COLOR });
  g.poly([0, 0, w, 0, w / 2, h]).stroke({
    color: INK_COLOR,
    width: ER_DEFAULTS.strokeWidth,
    join: "miter",
  });
  if (shape.exclusive) {
    // An arc round the apex, crossing the children's lines just below the triangle.
    const radius = w / 2 + ARC_REACH;
    g.arc(w / 2, h * 0.45, radius, Math.PI * 0.18, Math.PI * 0.82).stroke({
      color: INK_COLOR,
      width: ER_DEFAULTS.strokeWidth,
    });
  }
}
