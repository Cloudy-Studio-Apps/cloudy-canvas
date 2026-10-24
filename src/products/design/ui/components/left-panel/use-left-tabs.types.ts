import type { LeftTabEntry } from "../../modules";

/** The left panel's tabs for the current mode and the one showing. */
export interface LeftTabs {
  tabs: LeftTabEntry[];
  /** The picked tab, or the first one when the picked one isn't in this mode (or is gone). */
  current: LeftTabEntry | undefined;
}
