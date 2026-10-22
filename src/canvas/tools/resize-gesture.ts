import type { CanvasElement, ElementPatch } from "../elements";
import { scaleRectInBox } from "../geometry";
import { resizeCursor, resizeRect, type ResizeHandle, type ResizeTarget } from "../handles";
import type { Snapper } from "../snapping";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { CanvasPointer, ToolContext } from "./tool.types";

/**
 * Drags a resize handle of one element, or of the box around a multi-selection, which scales
 * every element in it (ones that can't be resized move by their center, with their members). Shift keeps the
 * proportions (always, when a kind keeps them), Alt resizes round the center. The dragged sides
 * snap to other elements.
 */
export class ResizeGesture {
  private started = false;
  private readonly snapper: Snapper;
  /** What moves with each element that can't be resized (e.g. a group's children), as it was. */
  private readonly followers = new Map<string, CanvasElement[]>();

  constructor(
    private readonly ctx: ToolContext,
    private readonly target: ResizeTarget,
    private readonly handle: ResizeHandle,
    private readonly start: CanvasPointer,
  ) {
    ctx.setCursor(resizeCursor(handle));
    const moving = new Set(target.elements.map((el) => el.id));
    if (target.elements.length > 1) {
      for (const el of target.elements) {
        if (ctx.kinds.kindOf(el).resizable) continue;
        const members: CanvasElement[] = [];
        for (const id of ctx.withMembers([el.id])) {
          const member = ctx.getElement(id);
          if (member && !member.locked) members.push(member);
          moving.add(id);
        }
        this.followers.set(el.id, members);
      }
    }
    this.snapper = ctx.createSnapper(moving);
  }

  /** Hides the snap guides (the drag ended). */
  end(): void {
    this.snapper.clear();
  }

  move(p: CanvasPointer): void {
    if (!this.started) {
      if (!pastThreshold(this.start, p, MOVE_THRESHOLD_PX)) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    const { kinds } = this.ctx;
    const { elements, box } = this.target;
    let dx = p.world.x - this.start.world.x;
    let dy = p.world.y - this.start.world.y;
    const options = {
      keepRatio: p.shiftKey || elements.some((el) => kinds.kindOf(el).keepsRatio),
      fromCenter: p.altKey,
    };
    let rect = resizeRect(box, this.handle, dx, dy, options);
    // The dragged sides follow the pointer one for one (round the center too), so a snap of a
    // side is a snap of the pointer.
    const snap = this.snapper.resize(rect, this.handle, p);
    if (snap.x !== 0 || snap.y !== 0) {
      dx += snap.x;
      dy += snap.y;
      rect = resizeRect(box, this.handle, dx, dy, options);
    }

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
      if (kind.resizable) {
        patches.set(el.id, kind.resize(el, to));
        continue;
      }
      // It keeps its size; its center (and what moves with it) follows the box.
      const dx = Math.round(to.x + (to.w - from.w) / 2 - from.x);
      const dy = Math.round(to.y + (to.h - from.h) / 2 - from.y);
      for (const member of this.followers.get(el.id) ?? [el])
        patches.set(member.id, kinds.kindOf(member).move(member, dx, dy));
    }
    this.ctx.doc.updateMany(patches);
  }
}
