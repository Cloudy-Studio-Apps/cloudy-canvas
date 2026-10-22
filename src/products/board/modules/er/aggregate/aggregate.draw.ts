import type { ElementTextStyle, ElementView } from "@canvas";

import { ER_DEFAULTS } from "../base/er.defaults";
import { INK_COLOR } from "../../../palette";
import type { ErAggregateElement } from "./aggregate.types";

/** An aggregation: a box round its relation and participants, with its name at the top left. */
export function drawErAggregate(
  view: ElementView,
  shape: ErAggregateElement,
  textStyle: ElementTextStyle,
): void {
  const { w, h } = shape;
  view.graphics
    .clear()
    .rect(0, 0, w, h)
    .stroke({ color: INK_COLOR, width: ER_DEFAULTS.strokeWidth * 1.5, alignment: 1 });
  view.placeText(shape.name, textStyle, w, h);
}
