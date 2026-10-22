import type { CanvasElement } from "../elements";
import { smoothPoints } from "../smooth-points";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

/**
 * The base of freehand drawing tools (template method): it collects the pointer's path (skipping
 * sub-pixel jitter), previews it as a draft, smooths it on release when the tool says so, and
 * adds the element as one undo step. Subclasses make the element from the points.
 */
export abstract class FreehandTool<
  O extends object = object,
  E extends CanvasElement = CanvasElement,
> implements Tool {
  abstract readonly id: string;
  readonly cursor: string = "crosshair";
  private points: number[] | null = null;

  constructor(protected readonly ctx: ToolContext<O>) {}

  /** The element for these world points (`index` is `""` for the preview). */
  protected abstract elementFor(points: number[], index: string): E;

  /** How much to smooth the finished line, in screen pixels; `null` keeps it as drawn. */
  protected smoothing(): number | null {
    return null;
  }

  /** Adds the finished element (subclasses may also place or select it). */
  protected add(el: E): void {
    this.ctx.doc.checkpoint();
    this.ctx.doc.add(el);
  }

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.points = [p.world.x, p.world.y];
    this.ctx.setDraft(this.elementFor(this.points, ""));
  }

  onPointerMove(p: CanvasPointer): void {
    const points = this.points;
    if (!points) return;
    const lastX = points[points.length - 2]!;
    const lastY = points[points.length - 1]!;
    // Skip sub-pixel jitter.
    if (Math.hypot(p.world.x - lastX, p.world.y - lastY) < 1 / this.ctx.camera.zoom) return;
    points.push(p.world.x, p.world.y);
    this.ctx.setDraft(this.elementFor(points, ""));
  }

  onPointerUp(): void {
    const points = this.points;
    this.points = null;
    this.ctx.setDraft(null);
    if (!points) return;
    const tolerance = this.smoothing();
    // The tolerance is in screen pixels, so smoothing feels the same at every zoom.
    const final =
      tolerance === null ? points : smoothPoints(points, tolerance / this.ctx.camera.zoom);
    this.add(this.elementFor(final, this.ctx.doc.nextIndex()));
  }

  onCancel(): void {
    this.points = null;
    this.ctx.setDraft(null);
  }
}
