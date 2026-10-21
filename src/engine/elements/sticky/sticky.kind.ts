import { INK_COLOR, STICKY_COLORS } from "../../document/palette";
import type { ElementView } from "../../render/element-view";
import type { ToolOptions } from "../../tools/tool.types";
import { TextBoxKind } from "../bases/text-box.kind";
import type { ElementPatch } from "../element.types";
import type { ElementSpec, ElementTextStyle } from "../element.kind.types";
import { createSticky } from "./sticky.factory";
import { drawSticky } from "./sticky.draw";
import { STICKY_DEFAULTS } from "./sticky.defaults";
import type { StickyElement } from "./sticky.types";

export class StickyKind extends TextBoxKind<StickyElement> {
  readonly type = "sticky";
  readonly label = "Sticky note";
  readonly description = "A colored note for jotting down an idea.";
  override readonly tool = "sticky";
  override readonly defaults = STICKY_DEFAULTS;

  draw(view: ElementView, el: StickyElement): void {
    drawSticky(view, el, this.textStyle());
  }

  protected textStyle(): ElementTextStyle {
    return {
      fontSize: STICKY_DEFAULTS.fontSize,
      color: INK_COLOR,
      align: "left",
      vAlign: "top",
      padX: STICKY_DEFAULTS.padding,
      padY: STICKY_DEFAULTS.padding,
    };
  }

  override build(spec: ElementSpec, index: string): StickyElement {
    const sticky = createSticky({ x: 0, y: 0 }, spec.color ?? STICKY_COLORS[0].value, index);
    const rect = this.specRect(spec, STICKY_DEFAULTS.size);
    return { ...sticky, ...rect, text: spec.text ?? "" };
  }

  override optionsOf(el: StickyElement): Partial<ToolOptions> {
    return { stickyColor: el.color };
  }

  override restyle(_el: StickyElement, options: Partial<ToolOptions>): ElementPatch<StickyElement> {
    return options.stickyColor ? { color: options.stickyColor } : {};
  }
}
