import type { ElementView } from "@canvas";

import { labelStyle } from "./text-measure";
import type { TextElement } from "./text.types";

/** Unwrapped (auto width), or wrapped in its width (fixed width). */
export function drawText(view: ElementView, el: TextElement): void {
  view.graphics.clear();
  const style = labelStyle(el);
  if (el.wrap) {
    view.placeText(el.text, style, el.w, el.h);
    return;
  }
  const text = view.setText(el.text, style);
  text.position.set(0, 0);
}
