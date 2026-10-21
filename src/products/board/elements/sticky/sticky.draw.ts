import type { ElementTextStyle, ElementView } from "@canvas";

import { PAPER_SHADOW_COLOR } from "../../palette";
import type { StickyElement } from "./sticky.types";

export function drawSticky(
  view: ElementView,
  el: StickyElement,
  textStyle: ElementTextStyle,
): void {
  view.graphics
    .clear()
    // Soft paper shadow
    .rect(1, 3, el.w - 2, el.h)
    .fill({ color: PAPER_SHADOW_COLOR, alpha: 0.07 })
    .rect(0, 0, el.w, el.h)
    .fill({ color: el.color })
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.06, width: 1, alignment: 1 });

  // TODO: Shrink the font when text overflows the note.
  view.placeText(el.text, textStyle, el.w, el.h);
}
