import type { PlacedGuide } from "../../ruler-guides";

/** The ruler guides to draw, and which one shows its value (it's being dragged). */
export interface RulerGuidesView {
  guides: readonly PlacedGuide[];
  /** Index (in the scope's list) of the guide whose value shows, if any. */
  active: number | null;
  /** How far the value's tag sits from the canvas's edge (past the rulers when shown), screen px. */
  inset: number;
}
