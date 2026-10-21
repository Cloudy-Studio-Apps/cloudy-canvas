import type { FileType } from "@shared/core";

/** `recent` keeps the order of the recent files list (last opened or saved first). */
export type RecentFilesSort = "recent" | "edited" | "name";

export interface RecentFilesFilter {
  query: string;
  type: FileType | "all";
  sort: RecentFilesSort;
}
