import { rotatePoint } from "../rotation";
import { rulerGuideKey, screenAxis, type PlacedGuide, type RulerGuide } from "../ruler-guides";
import type { Snapper, SnapAxis } from "../snapping";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { GuideFrame } from "./guide-drag.types";
import type { CanvasPointer, ToolContext } from "./tool.types";

/**
 * Drags a ruler guide (or a new one, out of a ruler) as one undo step: it snaps to the elements'
 * edges and the other guides, its value shows by the ruler, and dropping it back on its ruler
 * removes it (a new one dropped there is never added). A guide of a frame (`frame`: the one it
 * belongs to, or for a new one the frame the rulers measure) stays that frame's while it crosses
 * it, from its corner, and becomes a page guide past its edges; in a turned frame it moves along
 * the frame's own axes (`axis` is the frame's), and its ruler is the one closest to it.
 */
export class GuideDrag {
  private started = false;
  private readonly snapper: Snapper;
  /** Where the guide is in the scope's list while it's on the canvas; `null` while it's not. */
  private index: number | null;
  /** The screen axis it runs closest to: its ruler, and its axis as a page guide. */
  private readonly rulerAxis: SnapAxis;

  constructor(
    private readonly ctx: ToolContext,
    private readonly axis: SnapAxis,
    guide: PlacedGuide | null,
    private readonly frame: GuideFrame | null,
    private readonly start: CanvasPointer,
  ) {
    this.index = guide?.index ?? null;
    this.rulerAxis = screenAxis(axis, frame?.rotation ?? 0);
    this.snapper = ctx.createSnapper(guide ? [rulerGuideKey(guide.index)] : []);
    ctx.setCursor(guideCursor(this.rulerAxis));
  }

  move(p: CanvasPointer): void {
    if (!this.started) {
      if (!pastThreshold(this.start, p, MOVE_THRESHOLD_PX)) return;
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    if (this.ctx.overRuler(this.rulerAxis, p.screen)) {
      this.snapper.clear();
      this.place(null);
      return;
    }
    // In a turned frame, the guide runs along the frame's own axes and doesn't snap.
    const { frame } = this;
    if (frame?.rotation) {
      const local = rotatePoint(p.world, frame.bounds, -frame.rotation);
      const value = this.frameValue(local[this.axis]);
      if (value !== null) {
        this.snapper.clear();
        this.place({ axis: this.axis, value, frame: frame.id });
        return;
      }
    }
    const { rulerAxis } = this;
    const value = this.snapper.line(rulerAxis, p.world[rulerAxis], p);
    const inFrame = frame && !frame.rotation ? this.frameValue(value) : null;
    this.place(
      inFrame === null || !frame
        ? { axis: rulerAxis, value: round(value) }
        : { axis: this.axis, value: inFrame, frame: frame.id },
    );
  }

  /** Hides the snap lines and the value (the drag ended). */
  end(): void {
    this.snapper.clear();
    this.ctx.setActiveGuide(null);
  }

  /**
   * A value (in the frame's own frame) from the frame's corner while it crosses the frame;
   * `null` past its edges, where the guide becomes the page's.
   */
  private frameValue(value: number): number | null {
    if (!this.frame) return null;
    const { bounds } = this.frame;
    const start = bounds[this.axis];
    const size = this.axis === "x" ? bounds.w : bounds.h;
    return value >= start && value <= start + size ? round(value - start) : null;
  }

  /** Puts the guide last in the list, or takes it off the canvas (`null`). */
  private place(guide: RulerGuide | null): void {
    if (guide === null && this.index === null) return;
    const guides = [...this.ctx.guides()];
    if (this.index !== null) guides.splice(this.index, 1);
    if (guide === null) this.index = null;
    else this.index = guides.push(guide) - 1;
    this.ctx.setGuides(guides);
    this.ctx.setActiveGuide(this.index);
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The cursor over and while dragging a guide of `axis`. */
export function guideCursor(axis: SnapAxis): string {
  return axis === "x" ? "col-resize" : "row-resize";
}
