import type { Gradient } from "@canvas";

export interface PaintRecentsState {
  /** Gradients used last, newest first. */
  gradients: Gradient[];
  addGradient: (gradient: Gradient) => void;
}
