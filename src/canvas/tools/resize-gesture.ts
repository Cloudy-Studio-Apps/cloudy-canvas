import type { ElementPatch } from "../elements";
import { scaleRectInBox } from "../geometry";
import { resizeCursor, resizeRect, type ResizeHandle, type ResizeTarget } from "../handles";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { CanvasPointer, ToolContext } from "./tool.types";

/**
 * Drags a resize handle of one element, or of the box around a multi-selection, which scales
 * every element in it (ones that can't be resized move with their center). Shift keeps the
 * proportions (always, when a kind keeps them), Alt resizes round the center.
 */
export class ResizeGesture {
  private started = false;

  constructor(
    private readonly ctx: ToolContext,
    private readonly target: ResizeTarget,
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
    const { kinds } = this.ctx;
    const { elements, box } = this.target;
    const rect = resizeRect(
      box,
      this.handle,
      p.world.x - this.start.world.x,
      p.world.y - this.start.world.y,
      {
        keepRatio: p.shiftKey || elements.some((el) => kinds.kindOf(el).keepsRatio),
        fromCenter: p.altKey,
      },
    );

    const [single] = elements;
    if (single && elements.length === 1) {
      this.ctx.doc.update(single.id, kinds.kindOf(single).resize(single, rect));
      return;
    }
    const patches = new Map<string, ElementPatch>();
    for (const el of elements) {
      const kind = kinds.kindOf(el);
      const from = kind.bounds(el);
      const to = scaleRectInBox(from, box, rect);
      patches.set(
        el.id,
        kind.resizable
          ? kind.resize(el, to)
          : kind.move(
              el,
              Math.round(to.x + (to.w - from.w) / 2 - from.x),
              Math.round(to.y + (to.h - from.h) / 2 - from.y),
            ),
      );
    }
    this.ctx.doc.updateMany(patches);
  }
}
