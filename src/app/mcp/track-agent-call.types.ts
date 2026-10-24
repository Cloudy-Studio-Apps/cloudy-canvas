import type { Rect } from "@canvas";

/** What a tool call did in its agent's workspace. */
export interface TrackedCall {
  /** The elements it changed that still exist. */
  changed: string[];
  /** The box round what it changed (else what it named), `null` when nothing shows. */
  bounds: Rect | null;
}

export interface CallTracker {
  /** Stops watching and says what the call did. */
  finish(): TrackedCall;
}
