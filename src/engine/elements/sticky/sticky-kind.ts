import { INK_COLOR, STICKY_COLORS } from "../../document/palette";
import type { ElementView } from "../../render/element-view";
import type { ToolOptions } from "../../tools/tool.types";
import { BoxKind } from "../bases/box-kind";
import type { ElementPatch } from "../element.types";
import type { ElementSpec, ElementText } from "../element-kind.types";
import { createSticky } from "./create-sticky";
import { drawSticky } from "./draw-sticky";
import { STICKY_FONT_SIZE, STICKY_PADDING, STICKY_SIZE } from "./sticky-defaults";
import type { StickyElement } from "./sticky.types";

export class StickyKind extends BoxKind<StickyElement> {
  readonly type = "sticky";
  readonly label = "Sticky note";

  override readonly text: ElementText<StickyElement> = {
    ariaLabel: "Sticky note text",
    get: (el) => el.text,
    set: (el, text) => (text === el.text ? null : { text }),
    style: () => ({
      fontSize: STICKY_FONT_SIZE,
      color: INK_COLOR,
      align: "left",
      vAlign: "top",
      padX: STICKY_PADDING,
      padY: STICKY_PADDING,
    }),
  };

  draw(view: ElementView, el: StickyElement): void {
    drawSticky(view, el, this.text.style(el));
  }

  override build(spec: ElementSpec, index: string): StickyElement {
    const sticky = createSticky({ x: 0, y: 0 }, spec.color ?? STICKY_COLORS[0].value, index);
    return {
      ...sticky,
      x: spec.x,
      y: spec.y,
      w: spec.w ?? STICKY_SIZE,
      h: spec.h ?? STICKY_SIZE,
      text: spec.text ?? "",
    };
  }

  override describe(el: StickyElement) {
    return { label: el.text };
  }

  override optionsOf(el: StickyElement): Partial<ToolOptions> {
    return { stickyColor: el.color };
  }

  override restyle(_el: StickyElement, options: Partial<ToolOptions>): ElementPatch {
    return options.stickyColor ? { color: options.stickyColor } : {};
  }
}
