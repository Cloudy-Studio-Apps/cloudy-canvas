import type { ModelView } from "@canvas";

export type { ModelView };

export interface ModelFrame {
  /** Width over height of the model's projected bounds, clamped to `ASPECT_RANGE`. */
  aspect: number;
}
