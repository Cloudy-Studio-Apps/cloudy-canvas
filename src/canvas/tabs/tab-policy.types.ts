import type { FileTab, TabState } from "./file-tabs.types";

/** What `targetState` needs besides the tab. */
export interface PolicyContext {
  /** The tab on screen, `null` for Home. */
  activeId: string | null;
  now: number;
  /** The tab's place among the most recently shown ones (0 = most recent). */
  recentRank: number;
  /** Whether autosave is on: off, a hosted file's tab keeps its editor (`needsEditor`). */
  autosave: boolean;
}

/** What `planTabStates` reads. */
export interface PolicyInput {
  tabs: readonly FileTab[];
  activeId: string | null;
  now: number;
  /** Tabs already on their way down (left alone until they get there). */
  leaving: ReadonlySet<string>;
  /** Whether autosave is on. */
  autosave: boolean;
}

/** The background tabs whose state should change, and to what. */
export type TabStatePlan = Map<string, TabState>;
