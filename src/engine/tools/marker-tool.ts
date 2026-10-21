import { createStrokeShape } from "../document";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

/** Freehand drawing; the stroke is previewed live and added to the document on release. */
export class MarkerTool implements Tool {
  readonly id = "marker" as const;
  readonly cursor = "crosshair";
  private points: number[] | null = null;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.points = [p.world.x, p.world.y];
    this.ctx.drawDraftStroke(this.points);
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
    this.ctx.drawDraftStroke(points);
  }

  onPointerUp(): void {
    const points = this.points;
    this.points = null;
    this.ctx.drawDraftStroke(null);
    if (!points) return;

    const { markerColor, markerSize } = this.ctx.getOptions();
    const { doc } = this.ctx;
    doc.checkpoint();
    doc.add(createStrokeShape(points, markerColor, markerSize, doc.nextIndex()));
  }

  onCancel(): void {
    this.points = null;
    this.ctx.drawDraftStroke(null);
  }
}
