import {
  INK_COLOR,
  PAPER_SHADOW_COLOR,
  SECTION_FONT_SIZE,
  type SectionShape,
} from "../../document";
import { sectionTitleOrigin } from "../../sections";
import type { ShapeView } from "./shape-view";

/** A tinted area with a thin border and its title above the top-left corner. */
export function drawSection(view: ShapeView, shape: SectionShape): void {
  view.graphics
    .clear()
    .rect(0, 0, shape.w, shape.h)
    .fill({ color: shape.color })
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.14, width: 1, alignment: 1 });

  const origin = sectionTitleOrigin(shape);
  const title = view.setText(shape.text, {
    fontSize: SECTION_FONT_SIZE,
    color: INK_COLOR,
    fontWeight: "600",
  });
  title.position.set(origin.x - shape.x, origin.y - shape.y);
}
