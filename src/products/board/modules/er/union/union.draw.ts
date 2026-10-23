import type { ElementView } from "@canvas";

import { ER_FILL_COLOR, INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import type { ErUnionElement } from "./union.types";

/** A union type: a circle with a "U" (its lines to the superclasses and category are links). */
export function drawErUnion(view: ElementView, shape: ErUnionElement): void {
  const { w, h } = shape;
  view.graphics
    .clear()
    .circle(w / 2, h / 2, Math.min(w, h) / 2)
    .fill({ color: ER_FILL_COLOR })
    .stroke({ color: INK_COLOR, width: ER_DEFAULTS.strokeWidth });
  const letter = view.setTextSlot("kind", "U", {
    fontSize: ER_DEFAULTS.fontSize,
    color: INK_COLOR,
    fontWeight: "600",
  });
  letter.position.set((w - letter.width) / 2, (h - letter.height) / 2);
  view.pruneTextSlots(new Set(["kind"]));
}
