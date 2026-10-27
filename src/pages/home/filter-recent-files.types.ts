import type { HomeFileKind } from "./file-kind.types";

/** `recent` keeps the order of the recent files list (last opened or saved first). */
export type RecentFilesSort = "recent" | "edited" | "name";

export interface RecentFilesFilter {
  query: string;
  type: HomeFileKind | "all";
  sort: RecentFilesSort;
}
