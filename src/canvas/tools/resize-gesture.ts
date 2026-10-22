import {
  elementBounds,
  type CanvasElement,
  type ElementKind,
  type ElementPatch,
} from "../elements";
import { scalePatches } from "../arrange/scale";
import type { Point, Rect } from "../geometry.types";
import { rotatePoint } from "../rotation";
import { scaleRectInBox } from "../geometry";
import {
  resizeAnchor,
  resizeCursor,
  resizeRect,
  type ResizeHandle,
  type ResizeMode,
  type ResizeOptions,
  type ResizeTarget,
} from "../handles";
import type { Snapper } from "../snapping";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { CanvasPointer, ToolContext } from "./tool.types";

/**
 * Drags a resize handle of one element, or of the box around a multi-selection, which scales
 * every element in it (ones that can't be resized move by their center, with their members). Shift keeps the
 * proportions (always, when a kind keeps them), Alt resizes round the center. A turned element
 * resizes in its own frame, its opposite side staying put. The dragged sides of unturned ones snap
 * to other elements. In `scale` mode (the Scale tool) the proportions are always kept and every
 * element, with what moves with it, is scaled through its kind (`ElementKind.scale`): fonts,
 * strokes and radii grow with it.
 */
export class ResizeGesture {
  private started = false;
  private readonly snapper: Snapper;
  /** What moves with each element that can't be resized (e.g. a group's children), as it was. */
  private readonly followers = new Map<string, CanvasElement[]>();
  /** In `scale` mode, everything that scales (members included), as it was. */
  private readonly scaled: CanvasElement[] = [];

  constructor(
    private readonly ctx: ToolContext,
    private readonly target: ResizeTarget,
    private readonly handle: ResizeHandle,
    private readonly start: CanvasPointer,
    private readonly mode: ResizeMode = "resize",
  ) {
    ctx.setCursor(resizeCursor(handle, target.rotation));
    const moving = new Set(target.elements.map((el) => el.id));
    if (mode === "scale") {
      for (const id of ctx.withMembers(moving)) {
        const el = ctx.getElement(id);
        if (el && !el.locked) this.scaled.push(el);
        moving.add(id);
      }
    } else if (target.elements.length > 1) {
      for (const el of target.elements) {
        if (scales(el, ctx.kinds.kindOf(el))) continue;
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
    const { elements, box, rotation } = this.target;
    // A turned element resizes in its own (unturned) frame.
    const delta = rotatePoint(
      { x: p.world.x - this.start.world.x, y: p.world.y - this.start.world.y },
      { x: 0, y: 0 },
      -rotation,
    );
    let dx = delta.x;
    let dy = delta.y;
    const options = {
      keepRatio:
        this.mode === "scale" || p.shiftKey || elements.some((el) => kinds.kindOf(el).keepsRatio),
      fromCenter: p.altKey,
    };
    if (rotation) return this.resizeTurned(dx, dy, options);
    let rect = resizeRect(box, this.handle, dx, dy, options);
    // The dragged sides follow the pointer one for one (round the center too), so a snap of a
    // side is a snap of the pointer.
    const snap = this.snapper.resize(rect, this.handle, p);
    if (snap.x !== 0 || snap.y !== 0) {
      dx += snap.x;
      dy += snap.y;
      rect = resizeRect(box, this.handle, dx, dy, options);
    }
    if (this.mode === "scale") return this.scaleTo(rect, resizeAnchor(box, this.handle, p.altKey));

    const [single] = elements;
    if (single && elements.length === 1) {
      this.ctx.doc.update(single.id, kinds.kindOf(single).resize(single, rect));
      return;
    }
    const patches = new Map<string, ElementPatch>();
    for (const el of elements) {
      const kind = kinds.kindOf(el);
      const from = elementBounds(kind, el);
      const to = scaleRectInBox(from, box, rect);
      if (scales(el, kind)) {
        patches.set(el.id, kind.resize(el, to));
        continue;
      }
      // It keeps its size (and turn); its center, and what moves with it, follows the box.
      const dx = Math.round(to.x + (to.w - from.w) / 2 - from.x);
      const dy = Math.round(to.y + (to.h - from.h) / 2 - from.y);
      for (const member of this.followers.get(el.id) ?? [el])
        patches.set(member.id, kinds.kindOf(member).move(member, dx, dy));
    }
    this.ctx.doc.updateMany(patches);
  }

  /**
   * Resizes the one turned element in its own frame (a local delta), from its corner at 0, 0 so
   * nothing rounds it away, and turns the new corner back round the old one.
   */
  private resizeTurned(dx: number, dy: number, options: ResizeOptions): void {
    const { elements, box, rotation } = this.target;
    const [el] = elements;
    if (!el) return;
    const local = resizeRect({ ...box, x: 0, y: 0 }, this.handle, dx, dy, options);
    if (this.mode === "scale") {
      const anchor = resizeAnchor(box, this.handle, options.fromCenter);
      return this.scaleTo(local, rotatePoint(anchor, box, rotation));
    }
    const corner = rotatePoint({ x: box.x + local.x, y: box.y + local.y }, box, rotation);
    const rect = { ...local, x: hundredth(corner.x), y: hundredth(corner.y) };
    this.ctx.doc.update(el.id, this.ctx.kinds.kindOf(el).resize(el, rect));
  }

  /**
   * Scales everything by what the box became (`rect`, its proportions kept) round `anchor`, the
   * world point that stays put.
   */
  private scaleTo(rect: Rect, anchor: Point): void {
    const factor = scaleFactor(this.target.box, rect, this.handle);
    this.ctx.doc.updateMany(scalePatches(this.scaled, this.ctx.kinds, { origin: anchor, factor }));
  }
}

/**
 * How much a box scaled to `rect` grew: by the side the handle drags (a flat box, e.g. a
 * horizontal line, by the side it has).
 */
function scaleFactor(box: Rect, rect: Rect, handle: ResizeHandle): number {
  const horizontal = handle.includes("e") || handle.includes("w");
  if (box.w > 0 && (horizontal || box.h <= 0)) return rect.w / box.w;
  return box.h > 0 ? rect.h / box.h : 1;
}

/** Whether a multi-selection's resize scales the element (unturned resizable ones), or moves it. */
function scales(el: CanvasElement, kind: ElementKind): boolean {
  return kind.resizable && !el.rotation;
}

function hundredth(value: number): number {
  return Math.round(value * 100) / 100;
}
