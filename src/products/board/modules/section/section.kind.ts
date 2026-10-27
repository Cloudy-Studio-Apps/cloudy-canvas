import {
  centerTextTop,
  rectContainsPoint,
  TextBoxKind,
  type ElementPatch,
  type ElementSpec,
  type ElementTextStyle,
  type ElementView,
  type Point,
  type BindableField,
} from "@canvas";

import { colorField, colorTokenOptions, restyleColors } from "../../tokens";
import type { BoardToolOptions } from "../../board-options.types";
import { INK_COLOR, SECTION_COLORS } from "../../palette";
import { createSection } from "./section.factory";
import { drawSection } from "./section.draw";
import { SECTION_DEFAULTS } from "./section.defaults";
import { sectionTitleRect } from "./section-title";
import type { SectionElement } from "./section.types";
import { t } from "./section.i18n";

/**
 * A frame drawn behind everything else. It's grabbed by its title or border only, so clicks
 * inside reach its contents or start a marquee; what's inside moves and deletes with it.
 */
export class SectionKind extends TextBoxKind<SectionElement, BoardToolOptions> {
  readonly type = "section";
  readonly label = t("label");
  readonly description = t("description");
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

  /** Its color binds to a color variable. */
  override bindable(): BindableField[] {
    return [colorField("color", t("color"), "frame-fill")];
  }

  override optionsOf(el: SectionElement): Partial<BoardToolOptions> {
    return { sectionColor: el.color, ...colorTokenOptions(el, SECTION_DEFAULTS.colorOptions) };
  }

  override restyle(
    el: SectionElement,
    options: Partial<BoardToolOptions>,
  ): ElementPatch<SectionElement> {
    return restyleColors(el, options, SECTION_DEFAULTS.colorOptions);
  }
}
