import {
  LineKind,
  scaleLength,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type ScaleTransform,
  type BindableField,
} from "@canvas";
import { colorField, colorTokenOptions, restyleColors } from "../../tokens";
import type { BoardToolOptions } from "../../board-options.types";

import { drawStroke } from "./stroke.draw";
import { STROKE_DEFAULTS } from "./stroke.defaults";
import { strokeSizePatch } from "./stroke-size";
import { buildStroke, STROKE_SPEC_PROPERTIES, strokeSizeFrom } from "./stroke-spec";
import type { StrokeDefaults, StrokeElement } from "./stroke.types";
import { t } from "./draw.i18n";

/**
 * Freehand strokes, drawn with the pen or the highlighter. Their points are the content: they're
 * only moved, scaled, and restyled (color and thickness) from the options panel. Agents draw them from a
 * list of points.
 */
export class StrokeKind extends LineKind<StrokeElement, BoardToolOptions> {
  readonly type = "stroke";
  readonly label = t("label");
  readonly description = t("description");
  override readonly tool = "marker";
  override readonly defaults: StrokeDefaults = STROKE_DEFAULTS;
  override readonly styleFields = ["color", "size", "pen"];
  override readonly specProperties = STROKE_SPEC_PROPERTIES;
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y", "color", "size"]);

  draw(view: ElementView, el: StrokeElement): void {
    drawStroke(view, el);
  }

  protected lineWidth(el: StrokeElement): number {
    return el.size;
  }

  /** Scaled (the Scale tool), its line grows thicker with it, the padded bounds along. */
  override scale(el: StrokeElement, t: ScaleTransform): ElementPatch<StrokeElement> {
    return { ...super.scale(el, t), size: scaleLength(t, el.size) };
  }

  override build(spec: ElementSpec, index: string): StrokeElement {
    return buildStroke(spec, index);
  }

  override completePatch(
    el: StrokeElement,
    patch: ElementPatch<StrokeElement>,
  ): ElementPatch<StrokeElement> {
    const size = strokeSizeFrom(patch.size);
    if (size === undefined || size === el.size) return patch;
    return { ...patch, ...strokeSizePatch({ ...el, ...patch, size: el.size }, size) };
  }

  override fillDefaults(el: StrokeElement): StrokeElement {
    return { ...el, pen: el.pen ?? STROKE_DEFAULTS.pen };
  }

  /** A pen stroke's color binds to a color variable (a highlighter keeps its tints). */
  override bindable(el: StrokeElement): BindableField[] {
    return el.pen === "pen" ? [colorField("color", "Color", "stroke-color")] : [];
  }

  override optionsOf(el: StrokeElement): Partial<BoardToolOptions> {
    return el.pen === "highlighter"
      ? { drawPen: el.pen, highlighterColor: el.color, highlighterSize: el.size }
      : {
          drawPen: el.pen,
          markerColor: el.color,
          markerSize: el.size,
          ...colorTokenOptions(el, STROKE_DEFAULTS.colorOptions),
        };
  }

  override restyle(
    el: StrokeElement,
    options: Partial<BoardToolOptions>,
  ): ElementPatch<StrokeElement> {
    const highlighter = el.pen === "highlighter";
    const size = highlighter ? options.highlighterSize : options.markerSize;
    const patch: ElementPatch<StrokeElement> = highlighter
      ? options.highlighterColor
        ? { color: options.highlighterColor }
        : {}
      : restyleColors(el, options, STROKE_DEFAULTS.colorOptions);
    if (size !== undefined && size !== el.size) Object.assign(patch, strokeSizePatch(el, size));
    return patch;
  }
}
