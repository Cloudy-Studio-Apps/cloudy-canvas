import type { PathContour } from "../path";

/** Where a run of outlined text goes. */
export interface OutlineRunPlace {
  letterSpacing: number;
  /** Where its pen starts, and the baseline it sits on. */
  x: number;
  baseline: number;
}

/** A run's outlines, and how far they moved the pen. */
export interface OutlinedRun {
  contours: PathContour[];
  advance: number;
}
