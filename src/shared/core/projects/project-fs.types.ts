import type { TrashEntry } from "./trash-index.types";

export interface ProjectEntry {
  name: string;
  /** Path relative to the project root, `/`-separated. */
  rel: string;
  kind: "folder" | "board" | "design" | "other";
  /** ISO 8601 timestamp, null when unknown. */
  updatedAt: string | null;
}

/** Disk access for projects. Relative paths are `/`-separated; `root` is absolute. */
export interface ProjectFs {
  /** One level of `rel` (the root when omitted); the `.cloudy` folder and the `.cproject` are skipped. */
  scan(root: string, rel?: string): Promise<ProjectEntry[]>;
  createFolder(root: string, rel: string): Promise<string>;
  /** Moves into `toFolderRel`; returns the new rel (a unique name). */
  move(root: string, fromRel: string, toFolderRel: string): Promise<string>;
  rename(root: string, rel: string, name: string): Promise<string>;
  duplicate(root: string, rel: string): Promise<string>;
  toTrash(root: string, rel: string): Promise<TrashEntry>;
  /** Returns the rel it was restored to. */
  restore(root: string, entryId: string): Promise<string>;
  removeFromTrash(root: string, entryIds: string[] | "all"): Promise<void>;
  listTrash(root: string): Promise<TrashEntry[]>;
  size(path: string): Promise<number>;
  readText(path: string): Promise<string>;
  writeTextAtomic(path: string, text: string): Promise<void>;
  readBytes(path: string): Promise<Uint8Array>;
  writeBytesAtomic(path: string, bytes: Uint8Array): Promise<void>;
  exists(path: string): Promise<boolean>;
  makeHidden(path: string): Promise<void>;
  /** The folder holding a `.cproject` whose `id` is `projectId`, walking up from `filePath`; null if none. */
  findManifestAbove(filePath: string, projectId: string): Promise<string | null>;
}
