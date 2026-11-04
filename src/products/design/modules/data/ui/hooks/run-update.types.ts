import type { Emitter } from "@canvas";

/** The Updates the tab runs for one service: by source, and the Update all loop. */
export interface TabUpdates {
  bySource: Map<string, AbortController>;
  /** The running Update all's controller, `null` when none runs. */
  all: AbortController | null;
  /** Fires when Update all starts or ends. */
  changed: Emitter;
}
