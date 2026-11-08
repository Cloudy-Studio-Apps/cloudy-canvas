import type { MergePlan } from "@canvas";
import type { LibraryEntry } from "@shared/core";

/** A library of the project the file's styles can go to. */
export type MergeLibrary = Pick<LibraryEntry, "id" | "name">;

/** What `MergeSession.commit` does. */
export interface MergeCommit {
  /** The project folder the file goes to (relative, `""` for the root). */
  folder: string;
  /** The library its styles and pictures go to; `null` when the project has none to take them. */
  libraryId: string | null;
  /** The plan for that library, with the clashes' choices made. */
  plan: MergePlan | null;
}
