import type { ProjectManifest } from "@shared/core";

export interface ProjectActionsOptions {
  root: string;
  projectId: string;
  manifest: ProjectManifest;
  saveManifest: (patch: Partial<ProjectManifest>) => Promise<void>;
  /** The folder open in the Files tab. */
  folder: string;
  setFolder: (rel: string) => void;
  /** Files changed on disk: scans read again. */
  bump: () => void;
  /** A trashed item was put back at `rel`. */
  afterRestore?: (rel: string, from: string) => Promise<void>;
}
