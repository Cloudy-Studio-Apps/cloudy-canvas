import { displayName, type FileInfo } from "@shared/core";
import type { HomeFileKind } from "./file-kind.types";
import type { RecentFilesFilter } from "./filter-recent-files.types";

export const DEFAULT_RECENT_FILES_FILTER: RecentFilesFilter = {
  query: "",
  type: "all",
  sort: "recent",
};

const byName = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

/** The recent files that match the search and kind (`kindOf`), in the chosen order. */
export function filterRecentFiles(
  files: FileInfo[],
  filter: RecentFilesFilter,
  kindOf: (file: FileInfo) => HomeFileKind,
): FileInfo[] {
  const query = filter.query.trim().toLowerCase();
  const matching = files.filter(
    (file) =>
      (filter.type === "all" || kindOf(file) === filter.type) &&
      (!query || searchText(file).includes(query)),
  );
  switch (filter.sort) {
    case "recent":
      return matching;
    case "edited":
      return [...matching].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "name":
      return [...matching].sort((a, b) => byName.compare(displayName(a), displayName(b)));
  }
}

/** What a search matches: the file name, title and description. */
function searchText(file: FileInfo): string {
  return [file.name, file.title, file.description].filter(Boolean).join("\n").toLowerCase();
}
