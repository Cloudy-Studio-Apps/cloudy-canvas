import { createId } from "@core";

import { boundsOfPoints } from "../geometry";
import type { CanvasPointer, Tool, ToolContext } from "./types";

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

    const { markerColor: color, markerSize: size } = this.ctx.getOptions();
    const bounds = boundsOfPoints(points);
    const pad = size / 2;
    const x = bounds.x - pad;
    const y = bounds.y - pad;
    const relative = points.map((value, i) => (i % 2 === 0 ? value - x : value - y));

    this.ctx.doc.checkpoint();
    this.ctx.doc.add({
      id: createId(),
      type: "stroke",
      index: this.ctx.doc.nextIndex(),
      x,
      y,
      w: bounds.w + size,
      h: bounds.h + size,
      color,
      size,
      points: relative,
    });
  }

  onCancel(): void {
    this.points = null;
    this.ctx.drawDraftStroke(null);
  }
}
