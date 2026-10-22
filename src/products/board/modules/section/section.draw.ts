import type { ElementTextStyle, ElementView } from "@canvas";

import { PAPER_SHADOW_COLOR } from "../../palette";
import type { SectionElement } from "./section.types";

/** A tinted area with a thin border and its title at the top-left corner. */
export function drawSection(
  view: ElementView,
  el: SectionElement,
  textStyle: ElementTextStyle,
): void {
  view.graphics
    .clear()
    .rect(0, 0, el.w, el.h)
    .fill({ color: el.color })
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.14, width: 1, alignment: 1 });
  view.placeText(el.text, textStyle, el.w, el.h);
}
