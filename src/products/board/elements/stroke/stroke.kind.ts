import { type ElementPatch, type ElementView, LineKind } from "@canvas";
import type { BoardToolOptions } from "../../board-options.types";

import { drawStroke } from "./stroke.draw";
import { STROKE_DEFAULTS } from "./stroke.defaults";
import type { StrokeDefaults, StrokeElement } from "./stroke.types";

/**
 * Freehand strokes, drawn with the pen or the highlighter. Their points are the content: they're
 * only moved, and restyled (color and thickness) from the options panel.
 */
export class StrokeKind extends LineKind<StrokeElement, BoardToolOptions> {
  readonly type = "stroke";
  readonly label = "Draw";
  readonly description = "Pen, highlighter and eraser.";
  override readonly tool = "marker";
  override readonly defaults: StrokeDefaults = STROKE_DEFAULTS;
  override readonly creatable = false;
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y"]);

  draw(view: ElementView, el: StrokeElement): void {
    drawStroke(view, el);
  }

  protected lineWidth(el: StrokeElement): number {
    return el.size;
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
    if (size !== undefined && size !== el.size) {
      // The line stays where it is; the padded bounds grow or shrink around it.
      const d = (size - el.size) / 2;
      Object.assign(patch, {
        size,
        x: el.x - d,
        y: el.y - d,
        w: el.w + d * 2,
        h: el.h + d * 2,
        points: el.points.map((value) => value + d),
      });
    }
    return patch;
  }
}
