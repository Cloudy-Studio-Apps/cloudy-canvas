import type { ProjectEntry } from "@shared/core";

export interface FolderScan {
  /** One level of the folder; empty until it is read. */
  entries: ProjectEntry[];
  loading: boolean;
  refresh: () => void;
}
