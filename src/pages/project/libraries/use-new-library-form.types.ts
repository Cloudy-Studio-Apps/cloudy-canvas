import type { StylesSource } from "@pages/shared/projects";

/** Where a new library starts from. */
export type LibraryStart = "empty" | "file" | "copy" | "tokens";

/** The picked start: its file for a file or tokens JSON, the library to copy for a copy. */
export type LibraryStartChoice =
  { kind: "empty" } | { kind: "copy"; libraryId: string } | StylesSource;
