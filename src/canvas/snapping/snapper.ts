import type { Point, Rect } from "../geometry.types";
import type { ResizeHandle } from "../handles";
import type { CanvasPointer } from "../tools/tool.types";
import { spacingGaps, spacingSnap } from "./equal-spacing";
import { along, boxEdges, nearestOffset } from "./snap-edges";
import { snapLines } from "./snap-lines";
import type {
  AxisSnap,
  SnapAxis,
  SnapEdge,
  SnapFeedback,
  Snapper,
  SnapperHost,
  SnapTargets,
} from "./snap.types";

/** How close (screen px) a line must come to snap. */
const SNAP_PX = 5;
const AXES: readonly SnapAxis[] = ["x", "y"];

/**
 * Snaps one gesture: to the targets' edges and centers, to equal spacing between them (moves
 * only), and to whole units where nothing else snapped (`pixelGrid`). The targets are collected
 * on first use.
 */
export class GestureSnapper implements Snapper {
  private cached: SnapTargets | null = null;
  private shown = false;

  constructor(private readonly host: SnapperHost) {}

  move(box: Rect, p: CanvasPointer): Point {
    const offset = { x: 0, y: 0 };
    const gaps: (number | null)[] = [null, null];
    if (this.snapsToObjects(p)) {
      const targets = this.targets();
      const threshold = this.threshold();
      AXES.forEach((axis, i) => {
        const edge = nearestOffset(edgeValues(box, axis), targets[axis], threshold);
        const spacing = spacingSnap(
          along(box, axis),
          targets.boxes.map((b) => along(b, axis)),
          threshold,
        );
        const snap = pick(edge, spacing);
        if (!snap) return;
        offset[axis] = snap.offset;
        gaps[i] = snap.gap;
      });
    }
    this.round(offset, box.x, box.y);

    const moved = { ...box, x: box.x + offset.x, y: box.y + offset.y };
    this.showFor(
      AXES.map((axis) => boxEdges(moved, axis)),
      AXES.flatMap((axis, i) => {
        const gap = gaps[i];
        if (gap === null || gap === undefined) return [];
        const boxes = this.targets().boxes.map((b) => along(b, axis));
        return spacingGaps(axis, along(moved, axis), boxes, gap);
      }),
      p,
    );
    return offset;
  }

  resize(box: Rect, handle: ResizeHandle, p: CanvasPointer): Point {
    const sides: Record<SnapAxis, SnapEdge | null> = {
      x: draggedEdge(box, "x", handle.includes("w"), handle.includes("e")),
      y: draggedEdge(box, "y", handle.includes("n"), handle.includes("s")),
    };
    const offset = { x: 0, y: 0 };
    if (this.snapsToObjects(p)) {
      const targets = this.targets();
      for (const axis of AXES) {
        const side = sides[axis];
        if (side) offset[axis] = nearestOffset([side.value], targets[axis], this.threshold()) ?? 0;
      }
    }
    for (const axis of AXES) {
      const side = sides[axis];
      if (side && offset[axis] === 0 && this.host.settings().pixelGrid)
        offset[axis] = Math.round(side.value) - side.value;
    }
    const shifted = (axis: SnapAxis): SnapEdge[] => {
      const side = sides[axis];
      return side ? [{ value: side.value + offset[axis], marks: side.marks }] : [];
    };
    this.showFor([shifted("x"), shifted("y")], [], p);
    return offset;
  }

  point(world: Point, p: CanvasPointer): Point {
    const offset = { x: 0, y: 0 };
    if (this.snapsToObjects(p)) {
      const targets = this.targets();
      offset.x = nearestOffset([world.x], targets.x, this.threshold()) ?? 0;
      offset.y = nearestOffset([world.y], targets.y, this.threshold()) ?? 0;
    }
    this.round(offset, world.x, world.y);
    const at = { x: world.x + offset.x, y: world.y + offset.y };
    this.showFor([[{ value: at.x, marks: [at.y] }], [{ value: at.y, marks: [at.x] }]], [], p);
    return at;
  }

  clear(): void {
    if (!this.shown) return;
    this.shown = false;
    this.host.show(null);
  }

  private snapsToObjects(p: CanvasPointer): boolean {
    return this.host.settings().objects && !p.modKey;
  }

  private threshold(): number {
    return SNAP_PX / this.host.zoom();
  }

  private targets(): SnapTargets {
    this.cached ??= this.host.targets();
    return this.cached;
  }

  /** Rounds to whole units the axes nothing snapped on, with `pixelGrid`. */
  private round(offset: Point, x: number, y: number): void {
    if (!this.host.settings().pixelGrid) return;
    if (offset.x === 0) offset.x = Math.round(x) - x;
    if (offset.y === 0) offset.y = Math.round(y) - y;
  }

  /** Shows the lines the moving edges (per axis) share with the targets, and the gaps. */
  private showFor(moving: SnapEdge[][], gaps: SnapFeedback["gaps"], p: CanvasPointer): void {
    if (!this.snapsToObjects(p)) return this.clear();
    const targets = this.targets();
    const lines = AXES.flatMap((axis, i) => snapLines(axis, moving[i] ?? [], targets[axis]));
    if (lines.length === 0 && gaps.length === 0) return this.clear();
    this.shown = true;
    this.host.show({ lines, gaps });
  }
}

/** A box's start, center and end on `axis`. */
function edgeValues(box: Rect, axis: SnapAxis): number[] {
  return boxEdges(box, axis).map((edge) => edge.value);
}

/** The side of the box a handle drags on `axis` (`null` when it doesn't drag one). */
function draggedEdge(box: Rect, axis: SnapAxis, start: boolean, end: boolean): SnapEdge | null {
  if (!start && !end) return null;
  const [first, , last] = boxEdges(box, axis);
  return (start ? first : last) ?? null;
}

/** The closer of an edge snap and a spacing snap (the edge on a tie). */
function pick(edge: number | null, spacing: AxisSnap | null): AxisSnap | null {
  if (edge === null) return spacing;
  if (spacing && Math.abs(spacing.offset) < Math.abs(edge)) return spacing;
  return { offset: edge, gap: null };
}
