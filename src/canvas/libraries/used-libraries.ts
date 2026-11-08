import type { LibraryEntry } from "@shared/core";

import type { CanvasDocument, ProjectLink } from "../document";
import { libraryIdOf } from "./library-tags";

/** The libraries a file holds records of (tagged with their ids), whether it still uses them or not. */
export function heldLibraries(doc: CanvasDocument): Set<string> {
  const held = new Set<string>();
  for (const record of doc.tokenRecords()) {
    const id = libraryIdOf(record);
    if (id) held.add(id);
  }
  return held;
}

/**
 * The ids of the project libraries a file uses, in the project's order. With `"all"`: the
 * libraries new files take (`autoAdd`) plus every library of the project the file already holds
 * records of (`held`, see `heldLibraries`), so turning `autoAdd` off only keeps a library from
 * reaching files that don't have it yet. A list: the ones listed that the project still has.
 */
export function librariesUsedBy(
  link: ProjectLink,
  entries: readonly LibraryEntry[],
  held: ReadonlySet<string>,
): string[] {
  const sorted = [...entries].sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));
  if (link.libraryIds === "all") {
    return sorted.filter((entry) => entry.autoAdd || held.has(entry.id)).map((e) => e.id);
  }
  const listed = new Set(link.libraryIds);
  return sorted.filter((entry) => listed.has(entry.id)).map((entry) => entry.id);
}
