import type { ProjectEntry } from "@shared/core";
import type { FilesSort } from "./files-toolbar.types";

/** A copy of `entries` in the chosen order (newest first, or by name). */
export function sortEntries(entries: ProjectEntry[], sort: FilesSort): ProjectEntry[] {
  const byName = (a: ProjectEntry, b: ProjectEntry) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  return [...entries].sort(
    sort === "name"
      ? byName
      : (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || byName(a, b),
  );
}
