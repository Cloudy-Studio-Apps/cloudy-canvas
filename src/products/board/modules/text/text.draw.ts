import type { ElementView } from "@canvas";

import type { TextElement } from "./text.types";

export function drawText(view: ElementView, el: TextElement): void {
  view.graphics.clear();
  view.setText(el.text, { fontSize: el.fontSize, color: el.color });
}
