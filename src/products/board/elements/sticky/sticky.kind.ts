import {
  type ElementPatch,
  type ElementSpec,
  type ElementTextStyle,
  type ElementView,
} from "@canvas";

import { INK_COLOR, STICKY_COLORS } from "../../palette";
import type { BoardToolOptions } from "../../board-options.types";
import { QuickConnectKind } from "../connector/quick-connect.kind";
import { createSticky } from "./sticky.factory";
import { drawSticky } from "./sticky.draw";
import { STICKY_DEFAULTS } from "./sticky.defaults";
import type { StickyElement } from "./sticky.types";

export class StickyKind extends QuickConnectKind<StickyElement> {
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

  override optionsOf(el: StickyElement): Partial<BoardToolOptions> {
    return { stickyColor: el.color };
  }

  override restyle(
    _el: StickyElement,
    options: Partial<BoardToolOptions>,
  ): ElementPatch<StickyElement> {
    return options.stickyColor ? { color: options.stickyColor } : {};
  }
}
