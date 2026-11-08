import type { TrashEntry } from "@shared/core";

export interface ProjectTrash {
  /** What waits in the trash, the newest first; empty until read. */
  entries: TrashEntry[];
  count: number;
  /** Bytes the entries take. */
  size: number;
}
