import { resizeCursor, resizeRect, type ResizableShape, type ResizeHandle } from "../handles";
import type { CanvasPointer, ToolContext } from "./tool.types";

const DRAG_THRESHOLD = 3; // screen px

/** Drags a resize handle of one shape. Shift keeps the proportions. */
export class ResizeGesture {
  private started = false;

  constructor(
    private readonly ctx: ToolContext,
    private readonly origin: ResizableShape,
    private readonly handle: ResizeHandle,
    private readonly start: CanvasPointer,
  ) {
    ctx.setCursor(resizeCursor(handle));
  }

  move(p: CanvasPointer): void {
    if (!this.started) {
      const distance = Math.hypot(
        p.screen.x - this.start.screen.x,
        p.screen.y - this.start.screen.y,
      );
      if (distance < DRAG_THRESHOLD) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    const dx = p.world.x - this.start.world.x;
    const dy = p.world.y - this.start.world.y;
    this.ctx.doc.update(this.origin.id, resizeRect(this.origin, this.handle, dx, dy, p.shiftKey));
  }
}
