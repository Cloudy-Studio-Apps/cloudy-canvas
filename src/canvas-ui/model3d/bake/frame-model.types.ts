import type { ModelRotation } from "@canvas";

/** How a model is looked at. */
export interface ModelView {
  angle: ModelRotation;
  zoom: number;
}

export interface ModelFrame {
  /** Width over height of the model's projected bounds, clamped to `ASPECT_RANGE`. */
  aspect: number;
}
