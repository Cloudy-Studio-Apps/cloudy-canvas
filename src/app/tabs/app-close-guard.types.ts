import type { TabHandle } from "@canvas-ui/tabs/tab-handles.types";

/** A tab the window guard acts on: its name and its handle. */
export interface UnsavedTab {
  name: string;
  handle: TabHandle;
}

/** The close request waiting for the user's answer. */
export interface PendingQuit {
  resolve(quit: boolean): void;
  /** The tabs with changes nothing will save. */
  tabs: readonly UnsavedTab[];
}
