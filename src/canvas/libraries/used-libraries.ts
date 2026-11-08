import type { LibraryEntry } from "@shared/core";

import type { ProjectLink } from "../document";

/**
 * The ids of the project libraries a file uses: with `"all"`, the libraries new files take
 * (`autoAdd`); otherwise the ones listed that the project still has. In the project's order.
 */
export function librariesUsedBy(link: ProjectLink, entries: readonly LibraryEntry[]): string[] {
  const sorted = [...entries].sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));
  if (link.libraryIds === "all") return sorted.filter((entry) => entry.autoAdd).map((e) => e.id);
  const listed = new Set(link.libraryIds);
  return sorted.filter((entry) => listed.has(entry.id)).map((entry) => entry.id);
}
