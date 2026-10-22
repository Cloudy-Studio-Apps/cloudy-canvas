import type { Point, Rect } from "../geometry.types";
import type { ResizeHandle } from "../handles";
import type { CanvasPointer } from "../tools/tool.types";

/** What moving, resizing and drawing snap to. */
export interface SnapSettings {
  /** Other elements' edges and centers, and equal spacing between them (smart guides). */
  objects: boolean;
  /** Whole units, where nothing else snapped. */
  pixelGrid: boolean;
}

export type SnapAxis = "x" | "y";

/** An edge or center line of a box on one axis (on `x`, a vertical line at `value`). */
export interface SnapEdge {
  value: number;
  /** Where its marks sit along the line: the box's corners, or its middle for a center line. */
  marks: readonly number[];
}

/** What a gesture snaps to, collected once when it starts: the edges sorted by value. */
export interface SnapTargets {
  x: SnapEdge[];
  y: SnapEdge[];
  boxes: Rect[];
}

/** A line things lined up on (on `x`, a vertical line at `at`), with a × at each mark. */
export interface SnapLine {
  axis: SnapAxis;
  at: number;
  marks: number[];
}

/** A distance shown with its length: along `axis` from `from` to `to`, at `cross` on the other axis. */
export interface SnapGap {
  axis: SnapAxis;
  from: number;
  to: number;
  cross: number;
}

/** Smart guides and measurements drawn over the canvas, in world units. */
export interface SnapFeedback {
  lines: SnapLine[];
  gaps: SnapGap[];
  /** Tags at world points (e.g. a rotation's angle by the pointer). */
  labels?: SnapLabel[];
}

/** A tag showing `text` just below and right of `at` (world units). */
export interface SnapLabel {
  at: Point;
  text: string;
}

/** One axis's snap: the offset to add, and the gap length it repeats (equal spacing), if any. */
export interface AxisSnap {
  offset: number;
  gap: number | null;
}

/**
 * One gesture's snapping (`ToolContext.createSnapper`). Each call shows its guides; Ctrl/Cmd
 * (`p.modKey`) turns snapping to objects off for that move.
 */
export interface Snapper {
  /** The offset that snaps a box being moved (already at its raw position). */
  move(box: Rect, p: CanvasPointer): Point;
  /** The offset that snaps the edges `handle` drags of a box being resized. */
  resize(box: Rect, handle: ResizeHandle, p: CanvasPointer): Point;
  /** A point (a corner being drawn, a line end) snapped. */
  point(world: Point, p: CanvasPointer): Point;
  /** Hides the guides (the gesture ended). */
  clear(): void;
}

/** What a `Snapper` reads from the engine. */
export interface SnapperHost {
  targets(): SnapTargets;
  zoom(): number;
  settings(): SnapSettings;
  show(feedback: SnapFeedback | null): void;
}
