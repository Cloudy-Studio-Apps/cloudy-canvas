import type { ModelRotation } from "@canvas";

export interface OrbitDragOptions {
  /** The model's angle when a drag begins. */
  angle: () => ModelRotation;
  /** A step of the drag: the angle to show. */
  onTurn: (angle: ModelRotation) => void;
}
