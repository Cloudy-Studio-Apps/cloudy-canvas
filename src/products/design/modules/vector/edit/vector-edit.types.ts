import type { CanvasPointer } from "@canvas";

import type { SegmentHit } from "../../core";
import type { VectorElement } from "../vector.types";

/** What's selected in the vector being edited: vertex and segment indices of its network. */
export interface VectorEditSelection {
  vertices: ReadonlySet<number>;
  segments: ReadonlySet<number>;
}

/** What a press lands on in the edited vector, nearest first. */
export type VectorPart =
  | { kind: "handle"; segment: number; vertex: number }
  | { kind: "vertex"; vertex: number }
  | ({ kind: "segment" } & SegmentHit)
  | { kind: "none" };

/** A drag of the move tool: points, a tangent handle, or a marquee over points. */
export type MoveGesture =
  | {
      kind: "points";
      start: CanvasPointer;
      origin: VectorElement;
      vertices: Set<number>;
      started: boolean;
    }
  | {
      kind: "handle";
      origin: VectorElement;
      segment: number;
      vertex: number;
      mirror: boolean;
      started: boolean;
    }
  | { kind: "marquee"; start: CanvasPointer; origin: VectorElement; base: Set<number> };

/** A point the pen just placed, whose handles the drag pulls out. */
export interface PenPull {
  start: CanvasPointer;
  vertex: number;
  /** The segment that arrived at it, if any. */
  segment: number | null;
}

/** A segment the bend tool is curving. */
export interface BendGesture {
  origin: VectorElement;
  segment: number;
  t: number;
  started: boolean;
}
