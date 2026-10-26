import { FreehandTool, TokenStore } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { STROKE_DEFAULTS } from "./stroke.defaults";
import { createStroke } from "./stroke.factory";
import type { StrokeElement } from "./stroke.types";
import { newColorBindings } from "../../tokens";

/**
 * Freehand drawing with the picked pen (pen or highlighter), smoothed on release when smoothing
 * is on.
 */
export class MarkerTool extends FreehandTool<BoardToolOptions, StrokeElement> {
  readonly id = "marker" as const;

  protected override smoothing(): number | null {
    return this.ctx.getOptions().drawSmooth ? STROKE_DEFAULTS.smoothTolerance : null;
  }

  /** A stroke with the picked pen's color and thickness. */
  protected elementFor(points: number[], index: string): StrokeElement {
    const options = this.ctx.getOptions();
    return options.drawPen === "highlighter"
      ? createStroke(
          points,
          "highlighter",
          options.highlighterColor,
          options.highlighterSize,
          index,
        )
      : {
          ...createStroke(points, "pen", options.markerColor, options.markerSize, index),
          ...newColorBindings(options, STROKE_DEFAULTS.colorOptions, TokenStore.of(this.ctx.doc)),
        };
  }
}
