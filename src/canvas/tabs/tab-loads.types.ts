import type { FileType } from "@shared/core";
import type { FileTab, TabLoader, TabSource } from "./file-tabs.types";

/** What `TabLoads` reads and acts through: its `FileTabs`. */
export interface TabLoadsHost {
  loaders: Record<FileType, TabLoader>;
  get(id: string): FileTab | undefined;
  /** The tab's source, for its loader. */
  source(id: string): TabSource | undefined;
  /** Changes the tab `id` (nothing when it isn't there). */
  patch(id: string, patch: (tab: FileTab) => Partial<FileTab>): void;
}
