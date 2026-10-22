import {
  scaleRect,
  type ElementPatch,
  type ElementSpec,
  type ElementTextStyle,
  type ElementView,
  type ScaleTransform,
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
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "x",
    "y",
    "w",
    "h",
    "text",
    "color",
  ]);

  draw(view: ElementView, el: StickyElement): void {
    drawSticky(view, el, this.textStyle(el));
  }

  protected textStyle(el: StickyElement): ElementTextStyle {
    const scale = el.textScale ?? 1;
    return {
      fontSize: STICKY_DEFAULTS.fontSize * scale,
      color: INK_COLOR,
      align: "left",
      vAlign: "top",
      padX: STICKY_DEFAULTS.padding * scale,
      padY: STICKY_DEFAULTS.padding * scale,
    };
  }

  /** Scaled (the Scale tool), its text and padding grow with the note. */
  override scale(el: StickyElement, t: ScaleTransform): ElementPatch<StickyElement> {
    const textScale = Math.round((el.textScale ?? 1) * t.factor * 1000) / 1000;
    return { ...this.resize(el, scaleRect(t, el)), textScale };
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
