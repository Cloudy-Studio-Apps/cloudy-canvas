import { rulerGuideKey, type PlacedGuide, type RulerGuide } from "../ruler-guides";
import type { Snapper, SnapAxis } from "../snapping";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { GuideFrame } from "./guide-drag.types";
import type { CanvasPointer, ToolContext } from "./tool.types";

/**
 * Drags a ruler guide (or a new one, out of a ruler) as one undo step: it snaps to the elements'
 * edges and the other guides, its value shows by the ruler, and dropping it back on its ruler
 * removes it (a new one dropped there is never added). A guide of a frame (`frame`: the one it
 * belongs to, or for a new one the frame the rulers measure) stays that frame's while it crosses
 * it, from its corner, and becomes a page guide past its edges.
 */
export class GuideDrag {
  private started = false;
  private readonly snapper: Snapper;
  /** Where the guide is in the scope's list while it's on the canvas; `null` while it's not. */
  private index: number | null;

  constructor(
    private readonly ctx: ToolContext,
    private readonly axis: SnapAxis,
    guide: PlacedGuide | null,
    private readonly frame: GuideFrame | null,
    private readonly start: CanvasPointer,
  ) {
    this.index = guide?.index ?? null;
    this.snapper = ctx.createSnapper(guide ? [rulerGuideKey(guide.index)] : []);
    ctx.setCursor(guideCursor(axis));
  }

  move(p: CanvasPointer): void {
    if (!this.started) {
      if (!pastThreshold(this.start, p, MOVE_THRESHOLD_PX)) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    if (this.ctx.overRuler(this.axis, p.screen)) {
      this.snapper.clear();
      this.place(null);
      return;
    }
    this.place(this.snapper.line(this.axis, p.world[this.axis], p));
  }

  /** Hides the snap lines and the value (the drag ended). */
  end(): void {
    this.snapper.clear();
    this.ctx.setActiveGuide(null);
  }

  /** Puts the guide at the world `value`, last in the list, or takes it off the canvas (`null`). */
  private place(value: number | null): void {
    if (value === null && this.index === null) return;
    const guides = [...this.ctx.guides()];
    if (this.index !== null) guides.splice(this.index, 1);
    if (value === null) this.index = null;
    else this.index = guides.push(this.stored(value)) - 1;
    this.ctx.setGuides(guides);
    this.ctx.setActiveGuide(this.index);
  }

  /** The guide at the world `value`: its frame's while it crosses it, else the page's. */
  private stored(value: number): RulerGuide {
    const { axis, frame } = this;
    const round = (v: number) => Math.round(v * 100) / 100;
    if (frame) {
      const start = frame.bounds[axis];
      const size = axis === "x" ? frame.bounds.w : frame.bounds.h;
      if (value >= start && value <= start + size)
        return { axis, value: round(value - start), frame: frame.id };
    }
    return { axis, value: round(value) };
  }
}

/** The cursor over and while dragging a guide of `axis`. */
export function guideCursor(axis: SnapAxis): string {
  return axis === "x" ? "col-resize" : "row-resize";
}
