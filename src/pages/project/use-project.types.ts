import type { ProjectManifest, ProjectRecord } from "@shared/core";

/** `loading` until the registry and the manifest are read. */
export type ProjectStatus = "loading" | "ready" | "notFound" | "missing";

export interface UseProject {
  status: ProjectStatus;
  record: ProjectRecord | null;
  manifest: ProjectManifest | null;
  /** The `.cproject`'s name in the root, the one read (writes and the .zip use it). */
  manifestFile: string | null;
  /** Counts manifest writes, so images read from the data folder reload after one. */
  rev: number;
  reload: () => Promise<void>;
  /** Writes the `.cproject` with `patch` applied and updates the registry's record. */
  saveManifest: (patch: Partial<ProjectManifest>) => Promise<void>;
  /** Renames the project: the manifest's name and the `.cproject` read, to `<name>.cproject` (the folder stays). */
  renameProject: (name: string) => Promise<void>;
}
