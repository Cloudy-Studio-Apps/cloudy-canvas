import type { CanvasElement, CanvasPointer, Point, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { StrokeKind } from "./stroke.kind";

/** Eraser radius and trail length, in screen pixels. */
const ERASER_RADIUS = 8;
const TRAIL_POINTS = 12;
const TRAIL_ALPHA = 0.35;

/**
 * Removes whole strokes: the ones the eraser touches fade while dragging and are deleted together
 * on release, as one undo step. Only drawings are erased.
 */
export class EraserTool implements Tool {
  readonly id = "eraser" as const;
  readonly cursor = "crosshair";
  private hits: Set<string> | null = null;
  private trail: Point[] = [];

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.hits = new Set();
    this.trail = [p.world];
    this.sweep(p.world, p.world);
    this.showTrail();
  }

  onPointerMove(p: CanvasPointer): void {
    if (!this.hits) return;
    const last = this.trail[this.trail.length - 1] ?? p.world;
    this.sweep(last, p.world);
    this.trail.push(p.world);
    if (this.trail.length > TRAIL_POINTS) this.trail.shift();
    this.showTrail();
  }

  onPointerUp(): void {
    const hits = this.hits;
    this.reset();
    if (!hits || hits.size === 0) return;
    const { doc } = this.ctx;
    doc.checkpoint();
    doc.remove([...hits]);
  }

  onCancel(): void {
    this.reset();
  }

  /** Adds the strokes along the segment from `a` to `b` to the hits. */
  private sweep(a: Point, b: Point): void {
    const hits = this.hits;
    if (!hits) return;
    const radius = ERASER_RADIUS / this.ctx.camera.zoom;
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / radius));
    const before = hits.size;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const area = { x: p.x - radius, y: p.y - radius, w: radius * 2, h: radius * 2 };
      for (const el of this.ctx.elementsInRect(area)) {
        if (
          !hits.has(el.id) &&
          this.erasable(el) &&
          this.ctx.kinds.kindOf(el).hitTest(el, p, radius)
        ) {
          hits.add(el.id);
        }
      }
    }
    if (hits.size !== before) this.ctx.setFaded(hits);
  }

  private erasable(el: CanvasElement): boolean {
    return this.ctx.kinds.kindOf(el) instanceof StrokeKind;
  }

  /** A short fading line behind the eraser. */
  private showTrail(): void {
    const trail = [...this.trail];
    this.ctx.setGuide((g, view) => {
      const width = (ERASER_RADIUS * 2) / view.zoom;
      const first = trail[0];
      if (!first) return;
      if (trail.length === 1) {
        g.circle(first.x, first.y, width / 2).fill({ color: view.theme.grid, alpha: TRAIL_ALPHA });
        return;
      }
      g.moveTo(first.x, first.y);
      for (const p of trail.slice(1)) g.lineTo(p.x, p.y);
      g.stroke({ color: view.theme.grid, alpha: TRAIL_ALPHA, width, cap: "round", join: "round" });
    });
  }

  private reset(): void {
    this.hits = null;
    this.trail = [];
    this.ctx.setFaded(null);
    this.ctx.setGuide(null);
  }
}
