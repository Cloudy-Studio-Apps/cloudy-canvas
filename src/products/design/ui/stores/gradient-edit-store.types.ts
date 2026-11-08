/**
 * The paint the picker edits: a fill or stroke of the selection, by position, or a fill of one of
 * a vector's areas (`region`).
 */
export interface GradientEditTarget {
  field: "fills" | "strokes";
  index: number;
  region?: number;
}

export interface GradientEditState {
  /** The gradient open in the picker, `null` when none is (its handles show on the canvas). */
  target: GradientEditTarget | null;
  /** The selected stop: its index in the gradient's `stops` (as stored, not sorted). */
  stop: number;
  setTarget: (target: GradientEditTarget | null) => void;
  setStop: (stop: number) => void;
}
