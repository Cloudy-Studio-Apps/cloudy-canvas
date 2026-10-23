import {
  centerTextTop,
  rectContainsPoint,
  TextBoxKind,
  type ElementPatch,
  type ElementSpec,
  type ElementTextStyle,
  type ElementView,
  type Point,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { INK_COLOR, SECTION_COLORS } from "../../palette";
import { createSection } from "./section.factory";
import { drawSection } from "./section.draw";
import { SECTION_DEFAULTS } from "./section.defaults";
import { sectionTitleRect } from "./section-title";
import type { SectionElement } from "./section.types";

/**
 * A frame drawn behind everything else. It's grabbed by its title or border only, so clicks
 * inside reach its contents or start a marquee; what's inside moves and deletes with it.
 */
export class SectionKind extends TextBoxKind<SectionElement, BoardToolOptions> {
  readonly type = "section";
  readonly label = "Section";
  readonly description = "A titled area that groups and moves what's inside it.";
  override readonly tool = "section";
  override readonly defaults = SECTION_DEFAULTS;
  override readonly styleFields = ["color"];
  override readonly frame = true;
  override readonly connectable = false;
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "x",
    "y",
    "w",
    "h",
    "text",
    "color",
  ]);

  draw(view: ElementView, el: SectionElement): void {
    drawSection(view, el, this.textStyle());
  }

  protected textStyle(): ElementTextStyle {
    const { fontSize, titleHeight, titlePadding } = SECTION_DEFAULTS;
    return {
      fontSize,
      color: INK_COLOR,
      fontWeight: "600",
      align: "left",
      vAlign: "top",
      padX: titlePadding,
      padY: centerTextTop(titleHeight, fontSize),
      singleLine: true,
    };
  }

  override hitTest(el: SectionElement, p: Point, tolerance: number): boolean {
    if (rectContainsPoint(sectionTitleRect(el), p, tolerance)) return true;
    const band = tolerance + SECTION_DEFAULTS.borderReach;
    const inside =
      p.x > el.x + band &&
      p.x < el.x + el.w - band &&
      p.y > el.y + band &&
      p.y < el.y + el.h - band;
    return super.hitTest(el, p, band) && !inside;
  }

  override build(spec: ElementSpec, index: string): SectionElement {
    const rect = this.specRect(spec, SECTION_DEFAULTS.size);
    return createSection(
      rect,
      spec.text || "Section",
      spec.color ?? SECTION_COLORS[0].value,
      index,
    );
  }

  override optionsOf(el: SectionElement): Partial<BoardToolOptions> {
    return { sectionColor: el.color };
  }

  override restyle(
    _el: SectionElement,
    options: Partial<BoardToolOptions>,
  ): ElementPatch<SectionElement> {
    return options.sectionColor ? { color: options.sectionColor } : {};
  }
}
