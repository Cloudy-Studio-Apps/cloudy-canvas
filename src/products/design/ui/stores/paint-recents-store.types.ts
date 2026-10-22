import type { Gradient } from "@canvas";

export interface PaintRecentsState {
  /** Solid colors picked last (`#rrggbb`), newest first. */
  colors: string[];
  /** Gradients used last, newest first. */
  gradients: Gradient[];
  add: (color: string) => void;
  addGradient: (gradient: Gradient) => void;
}
