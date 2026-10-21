import { INK_COLOR, PAPER_SHADOW_COLOR, STICKY_FONT_SIZE, STICKY_PADDING } from "../../document";
import type { StickyShape } from "../../document";
import type { ShapeView } from "./shape-view";

export function drawSticky(view: ShapeView, shape: StickyShape): void {
  view.graphics
    .clear()
    // Soft paper shadow
    .rect(1, 3, shape.w - 2, shape.h)
    .fill({ color: PAPER_SHADOW_COLOR, alpha: 0.07 })
    .rect(0, 0, shape.w, shape.h)
    .fill({ color: shape.color })
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.06, width: 1, alignment: 1 });

  const text = view.setText(shape.text, {
    fontSize: STICKY_FONT_SIZE,
    color: INK_COLOR,
    wrapWidth: shape.w - STICKY_PADDING * 2,
  });
  // TODO: Shrink the font when text overflows the note.
  text.position.set(STICKY_PADDING, STICKY_PADDING);
}
