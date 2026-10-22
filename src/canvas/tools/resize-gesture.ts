import type { CanvasElement } from "../elements";
import { resizeCursor, resizeRect, type ResizeHandle } from "../handles";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { CanvasPointer, ToolContext } from "./tool.types";

/** Drags a resize handle of one element. Shift keeps the proportions (always, for some kinds). */
export class ResizeGesture {
  private started = false;

  constructor(
    private readonly ctx: ToolContext,
    private readonly origin: CanvasElement,
    private readonly handle: ResizeHandle,
    private readonly start: CanvasPointer,
  ) {
    ctx.setCursor(resizeCursor(handle));
  }

  move(p: CanvasPointer): void {
    if (!this.started) {
      if (!pastThreshold(this.start, p, MOVE_THRESHOLD_PX)) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    const dx = p.world.x - this.start.world.x;
    const dy = p.world.y - this.start.world.y;
    const kind = this.ctx.kinds.kindOf(this.origin);
    const keepRatio = p.shiftKey || kind.keepsRatio;
    const rect = resizeRect(kind.bounds(this.origin), this.handle, dx, dy, keepRatio);
    this.ctx.doc.update(this.origin.id, kind.resize(this.origin, rect));
  }
}
