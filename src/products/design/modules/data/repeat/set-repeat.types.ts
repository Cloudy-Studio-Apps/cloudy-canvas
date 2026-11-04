import type { ElementKinds } from "@canvas";

/** How `setRepeat` sets a repeat up. */
export interface SetRepeatOptions {
  /** Give a frame without an auto layout a wrapping row, so its copies line up (needs `kinds`). */
  addLayout?: boolean;
  /** The design's kinds, which the layout's guess measures layers with. */
  kinds?: ElementKinds;
}
