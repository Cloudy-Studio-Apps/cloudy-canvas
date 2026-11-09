import type { FileTabs } from "@canvas";
import type { FileInfo } from "@shared/core";

/** The tab an editor shows: the app's tabs and its id, and what its file tells the tab. */
export interface TabContextValue {
  tabs: FileTabs;
  tabId: string;
  /** Whether the file has changes nothing saved yet (the tab's dot). */
  reportUnsaved(unsaved: boolean): void;
  /** The file the document was just saved in, so the tab's `load.info` follows it. */
  reportInfo(info: FileInfo): void;
  /** The name to show for the file (its title, or its file name). */
  reportName(name: string): void;
}

/** The route search params a tab keeps from when it opened. */
export type TabParam = "dir" | "project" | "libraries" | "starter" | "mode";
