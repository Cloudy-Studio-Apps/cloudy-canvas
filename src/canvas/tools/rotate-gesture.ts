import type { CanvasElement, ElementPatch } from "../elements";
import { rectCenter } from "../geometry";
import type { Point } from "../geometry.types";
import { cornerRotateCursor, rotateCursor, type ResizeHandle, type ResizeTarget } from "../handles";
import { angleOf, normalizeAngle, rotatePoint } from "../rotation";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { CanvasPointer, ToolContext } from "./tool.types";

/** Shift turns in steps of this many degrees. */
const SNAP_DEGREES = 15;

/**
 * Turns the selection by dragging round its center from a corner's rotate zone, as one undo step:
 * each element, with what moves with it, turns round the same point (`ElementKind.rotate`). Shift
 * steps the turn (one element's angle) by 15°. The angle shows by the pointer.
 */
export class RotateGesture {
  private started = false;
  private readonly pivot: Point;
  private readonly startAngle: number;
  /** What turns, as it was when the drag started. */
  private readonly origins = new Map<string, CanvasElement>();

  constructor(
    private readonly ctx: ToolContext,
    private readonly target: ResizeTarget,
    corner: ResizeHandle,
    private readonly start: CanvasPointer,
  ) {
    const { box, rotation } = target;
    this.pivot = rotatePoint(rectCenter(box), box, rotation);
    this.startAngle = angleOf(start.world, this.pivot);
    for (const id of ctx.withMembers(target.elements.map((el) => el.id))) {
      const el = ctx.getElement(id);
      if (el && !el.locked && ctx.kinds.kindOf(el).rotatable) this.origins.set(id, el);
    }
    ctx.setCursor(cornerRotateCursor(corner, rotation));
  }

  move(p: CanvasPointer): void {
    if (!this.started) {
      if (!pastThreshold(this.start, p, MOVE_THRESHOLD_PX)) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    const pointer = angleOf(p.world, this.pivot);
    // One element's own angle steps by 15°; several turn by steps from where they were.
    const base = this.target.elements.length === 1 ? this.target.rotation : 0;
    let turn = normalizeAngle(pointer - this.startAngle);
    if (p.shiftKey)
      turn = normalizeAngle(Math.round((base + turn) / SNAP_DEGREES) * SNAP_DEGREES - base);

    const patches = new Map<string, ElementPatch>();
    for (const [id, el] of this.origins)
      patches.set(id, this.ctx.kinds.kindOf(el).rotate(el, turn, this.pivot));
    this.ctx.doc.updateMany(patches);
    this.ctx.setCursor(rotateCursor(pointer));
    this.ctx.setSnapFeedback({
      lines: [],
      gaps: [],
      labels: [{ at: p.world, text: `${normalizeAngle(base + turn)}°` }],
    });
  }

  /** Hides the angle (the drag ended). */
  end(): void {
    this.ctx.setSnapFeedback(null);
  }
}
