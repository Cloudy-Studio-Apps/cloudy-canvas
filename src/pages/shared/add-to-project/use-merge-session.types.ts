import type { FileInfo, ProjectRecord } from "@shared/core";
import type { MergeSession } from "./merge-session";

/** The file and project being read for Add to project. */
export type MergeSessionState =
  | { status: "idle" | "loading" | "failed"; session: null }
  | { status: "ready"; session: MergeSession };

/** What `useMergeSession` read, and for which file and project (`null`: it couldn't). */
export interface OpenedSession {
  file: FileInfo;
  project: ProjectRecord;
  session: MergeSession | null;
}
