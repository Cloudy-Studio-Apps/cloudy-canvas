import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { createStroke, smoothPoints, STROKE_DEFAULTS, type StrokeElement } from "../elements";

/**
 * Freehand drawing with the picked pen (pen or highlighter). The stroke is previewed as a draft
 * and added to the document on release, smoothed first when smoothing is on.
 */
export class MarkerTool implements Tool {
  readonly id = "marker" as const;
  readonly cursor = "crosshair";
  private points: number[] | null = null;

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.points = [p.world.x, p.world.y];
    this.ctx.setDraft(this.stroke(this.points, ""));
  }

  onPointerMove(p: CanvasPointer): void {
    const points = this.points;
    if (!points) return;
    const lastX = points[points.length - 2]!;
    const lastY = points[points.length - 1]!;
    // Skip sub-pixel jitter
    const minDistance = 1 / this.ctx.camera.zoom;
    if (Math.hypot(p.world.x - lastX, p.world.y - lastY) < minDistance) return;
    points.push(p.world.x, p.world.y);
    this.ctx.setDraft(this.stroke(points, ""));
  }

  onPointerUp(): void {
    const points = this.points;
    this.points = null;
    this.ctx.setDraft(null);
    if (!points) return;

    const { doc, camera } = this.ctx;
    const smooth = this.ctx.getOptions().drawSmooth;
    // The tolerance is in screen pixels, so smoothing feels the same at every zoom.
    const final = smooth
      ? smoothPoints(points, STROKE_DEFAULTS.smoothTolerance / camera.zoom)
      : points;
    const stroke = this.stroke(final, doc.nextIndex());
    doc.checkpoint();
    doc.add(stroke);
  }

  onCancel(): void {
    this.points = null;
    this.ctx.setDraft(null);
  }

  /** A stroke with the picked pen's color and thickness. */
  private stroke(points: number[], index: string): StrokeElement {
    const options = this.ctx.getOptions();
    return options.drawPen === "highlighter"
      ? createStroke(
          points,
          "highlighter",
          options.highlighterColor,
          options.highlighterSize,
          index,
        )
      : createStroke(points, "pen", options.markerColor, options.markerSize, index);
  }
}
