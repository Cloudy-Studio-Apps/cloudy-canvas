import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { createStroke } from "../elements";

/** Freehand drawing; the stroke is previewed as a draft and added to the document on release. */
export class MarkerTool implements Tool {
  readonly id = "marker" as const;
  readonly cursor = "crosshair";
  private points: number[] | null = null;

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.points = [p.world.x, p.world.y];
    this.showDraft(this.points);
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
    this.showDraft(points);
  }

  onPointerUp(): void {
    const points = this.points;
    this.points = null;
    this.ctx.setDraft(null);
    if (!points) return;

    const { markerColor, markerSize } = this.ctx.getOptions();
    const { doc } = this.ctx;
    doc.checkpoint();
    doc.add(createStroke(points, markerColor, markerSize, doc.nextIndex()));
  }

  onCancel(): void {
    this.points = null;
    this.ctx.setDraft(null);
  }

  private showDraft(points: number[]): void {
    const { markerColor, markerSize } = this.ctx.getOptions();
    this.ctx.setDraft(createStroke(points, markerColor, markerSize, ""));
  }
}
