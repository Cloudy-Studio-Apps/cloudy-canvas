import type { ElementTextStyle, ElementView } from "@canvas";

import { ER_DEFAULTS } from "../base/er.defaults";
import { ER_FILL_COLOR } from "../../../palette";
import type { ErEntityElement } from "./entity.types";

/** An entity: a rectangle with its name, doubled when the entity is weak. */
export function drawErEntity(
  view: ElementView,
  shape: ErEntityElement,
  textStyle: ElementTextStyle,
): void {
  const { w, h, color } = shape;
  const g = view.graphics.clear().rect(0, 0, w, h).fill({ color: ER_FILL_COLOR });
  g.rect(0, 0, w, h).stroke({ color, width: ER_DEFAULTS.strokeWidth, alignment: 1 });
  if (shape.weak) {
    const d = ER_DEFAULTS.doubleGap;
    g.rect(d, d, w - d * 2, h - d * 2).stroke({
      color,
      width: ER_DEFAULTS.strokeWidth,
      alignment: 1,
    });
  }
  view.placeText(shape.name, textStyle, w, h);
}
