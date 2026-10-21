import type { FileInfo } from "@shared/core";
import type { RecentFilesFilter } from "./filter-recent-files.types";

export const DEFAULT_RECENT_FILES_FILTER: RecentFilesFilter = {
  query: "",
  type: "all",
  sort: "recent",
};

const byName = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

/** The recent files that match the search and type, in the chosen order. */
export function filterRecentFiles(files: FileInfo[], filter: RecentFilesFilter): FileInfo[] {
  const query = filter.query.trim().toLowerCase();
  const matching = files.filter(
    (file) =>
      (filter.type === "all" || file.type === filter.type) &&
      (!query || file.name.toLowerCase().includes(query)),
  );
  switch (filter.sort) {
    case "recent":
      return matching;
    case "edited":
      return [...matching].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "name":
      return [...matching].sort((a, b) => byName.compare(a.name, b.name));
  }
}
