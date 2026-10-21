import type { FileInfo } from "@shared/core";

/** The new index an edit writes, and what the edit returns to its caller. */
export interface IndexEdit<T> {
  files: FileInfo[];
  result: T;
}
