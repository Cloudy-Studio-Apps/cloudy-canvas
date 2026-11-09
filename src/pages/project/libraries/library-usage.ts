import type { LibraryEntry } from "@shared/core";
import { t } from "../project.i18n";

/**
 * How many files use a library. A file's link (which libraries it uses) is saved inside the file
 * and the project home doesn't open files, so this is the rule: a library that new files take
 * (`autoAdd`) is used by every board and design of the project, one that doesn't is used by the
 * files that turned it on, which aren't counted (`null`). `fileCount` is the project's number of
 * files, `null` while it is being counted.
 */
export function usedByCount(entry: LibraryEntry, fileCount: number | null): number | null {
  return entry.autoAdd ? fileCount : null;
}

/** "Used by 13 files", or what is known when the count isn't. */
export function usedByText(entry: LibraryEntry, fileCount: number | null): string {
  const count = usedByCount(entry, fileCount);
  if (count !== null) return t("libraries.usedBy", { count });
  return entry.autoAdd ? "" : t("libraries.usedManual");
}
