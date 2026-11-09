import type { FileTabs } from "@canvas";

/** The tab an editor shows: the app's tabs and its id. */
export interface TabContextValue {
  tabs: FileTabs;
  tabId: string;
}

/** The route search params a tab keeps from when it opened. */
export type TabParam = "dir" | "project" | "libraries" | "starter" | "mode";
