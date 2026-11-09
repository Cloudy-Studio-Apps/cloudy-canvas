import type { Store } from "../utils";
import type { FileTab, FileTabsSnapshot, TabState } from "./file-tabs.types";

/** What `TabMemory` reads and acts through: its `FileTabs`. */
export interface TabMemoryHost {
  store: Store<FileTabsSnapshot>;
  get(id: string): FileTab | undefined;
  setState(id: string, state: TabState): void;
  now(): number;
}
