import {
  LineKind,
  scaleLength,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type ScaleTransform,
} from "@canvas";
import type { BoardToolOptions } from "../../board-options.types";

import { drawStroke } from "./stroke.draw";
import { STROKE_DEFAULTS } from "./stroke.defaults";
import { strokeSizePatch } from "./stroke-size";
import { buildStroke, STROKE_SPEC_PROPERTIES, strokeSizeFrom } from "./stroke-spec";
import type { StrokeDefaults, StrokeElement } from "./stroke.types";

/**
 * Freehand strokes, drawn with the pen or the highlighter. Their points are the content: they're
 * only moved, scaled, and restyled (color and thickness) from the options panel. Agents draw them from a
 * list of points.
 */
export class StrokeKind extends LineKind<StrokeElement, BoardToolOptions> {
  readonly type = "stroke";
  readonly label = "Draw";
  readonly description = "Pen, highlighter and eraser.";
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

  override optionsOf(el: StrokeElement): Partial<BoardToolOptions> {
    return el.pen === "highlighter"
      ? { drawPen: el.pen, highlighterColor: el.color, highlighterSize: el.size }
      : { drawPen: el.pen, markerColor: el.color, markerSize: el.size };
  }

  override restyle(
    el: StrokeElement,
    options: Partial<BoardToolOptions>,
  ): ElementPatch<StrokeElement> {
    const highlighter = el.pen === "highlighter";
    const color = highlighter ? options.highlighterColor : options.markerColor;
    const size = highlighter ? options.highlighterSize : options.markerSize;
    const patch: ElementPatch<StrokeElement> = {};
    if (color) patch.color = color;
    if (size !== undefined && size !== el.size) Object.assign(patch, strokeSizePatch(el, size));
    return patch;
  }
}
