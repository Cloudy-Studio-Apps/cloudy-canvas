import { rulerGuideKey } from "../ruler-guides";
import type { Snapper, SnapAxis } from "../snapping";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { CanvasPointer, ToolContext } from "./tool.types";

/**
 * Drags a ruler guide (or a new one, out of a ruler) as one undo step: it snaps to the elements'
 * edges and the other guides, its value shows by the ruler, and dropping it back on its ruler
 * removes it (a new one dropped there is never added).
 */
export class GuideDrag {
  private started = false;
  private readonly snapper: Snapper;
  /** Where the guide is in the scope's list while it's on the canvas; `null` while it's not. */
  private index: number | null;

  constructor(
    private readonly ctx: ToolContext,
    private readonly axis: SnapAxis,
    index: number | null,
    private readonly start: CanvasPointer,
  ) {
    this.index = index;
    this.snapper = ctx.createSnapper(index === null ? [] : [rulerGuideKey(index)]);
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
    const value = this.snapper.line(this.axis, p.world[this.axis], p);
    this.place(Math.round(value * 100) / 100);
  }

  /** Hides the snap lines and the value (the drag ended). */
  end(): void {
    this.snapper.clear();
    this.ctx.setActiveGuide(null);
  }

  /** Puts the guide at `value`, last in the list, or takes it off the canvas (`null`). */
  private place(value: number | null): void {
    if (value === null && this.index === null) return;
    const guides = [...this.ctx.guides()];
    if (this.index !== null) guides.splice(this.index, 1);
    if (value === null) this.index = null;
    else this.index = guides.push({ axis: this.axis, value }) - 1;
    this.ctx.setGuides(guides);
    this.ctx.setActiveGuide(this.index);
  }
}

/** The cursor over and while dragging a guide of `axis`. */
export function guideCursor(axis: SnapAxis): string {
  return axis === "x" ? "col-resize" : "row-resize";
}
