import type { FileType } from "@shared/core";

/** One file saved as open in a tab (file ids, not tab ids). */
export interface SavedTab {
  type: FileType;
  fileId: string;
}

/** What `cloudy-canvas:tabs` holds. */
export interface SavedTabs {
  tabs: SavedTab[];
  /** The `fileId` of the tab that was shown, `null` for Home. */
  active: string | null;
}

export interface TabsPersistenceOptions {
  /** The app started on Home (`/`), not on a file the OS or a link opened. */
  startedOnHome: boolean;
  /** Shows a route (the saved active tab's, which the route sync then activates). */
  navigate: (route: string) => void;
}
