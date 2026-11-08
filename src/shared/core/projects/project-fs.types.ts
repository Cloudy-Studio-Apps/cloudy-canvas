import type { ProjectManifest } from "./project-manifest.types";
import type { TrashEntry } from "./trash-index.types";

export interface ProjectEntry {
  name: string;
  /** Path relative to the project root, `/`-separated. */
  rel: string;
  kind: "folder" | "board" | "design" | "other";
  /** ISO 8601 timestamp, null when unknown. */
  updatedAt: string | null;
}

/** A project's manifest with the `.cproject` it was read from. */
export interface ManifestFile {
  manifest: ProjectManifest;
  /** The `.cproject`'s name in the project root (not always `<manifest.name>.cproject`). */
  file: string;
  /** Its absolute path. */
  path: string;
}

/** A manifest found by walking up from a file (`findManifestAbove`), with its project's folder. */
export interface FoundManifest extends ManifestFile {
  root: string;
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
  /**
   * Moves `rel` into `.cloudy/trash/`; the index entry is written first (an entry whose item is
   * missing isn't listed), so a crash midway never leaves an item nobody sees.
   */
  toTrash(root: string, rel: string): Promise<TrashEntry>;
  /**
   * Puts a copy of a file from outside the project (`bytes`) into its trash, as if `name` had
   * been deleted from the root: restoring it puts it in the project's root.
   */
  copyToTrash(root: string, name: string, bytes: Uint8Array): Promise<TrashEntry>;
  /** Returns the rel it was restored to. */
  restore(root: string, entryId: string): Promise<string>;
  removeFromTrash(root: string, entryIds: string[] | "all"): Promise<void>;
  /** The trash's entries whose item is there. */
  listTrash(root: string): Promise<TrashEntry[]>;
  size(path: string): Promise<number>;
  readText(path: string): Promise<string>;
  writeTextAtomic(path: string, text: string): Promise<void>;
  readBytes(path: string): Promise<Uint8Array>;
  writeBytesAtomic(path: string, bytes: Uint8Array): Promise<void>;
  exists(path: string): Promise<boolean>;
  /**
   * Deletes a file for good (not a folder): the original of a file added to a project, once its
   * copy in the project is written. Throws for a folder.
   */
  removeFile(path: string): Promise<void>;
  makeHidden(path: string): Promise<void>;
  /**
   * The manifest of a project whose `.cproject` is in `root` (the one with `id` when given); null
   * when there is none or it is unreadable.
   */
  readManifest(root: string, id?: string): Promise<ProjectManifest | null>;
  /**
   * `readManifest` with the file it read: writes go back to that file, whatever its name.
   */
  readManifestFile(root: string, id?: string): Promise<ManifestFile | null>;
  /**
   * The nearest `.cproject` above `filePath` whose `id` is `projectId`, or whose `copiedFrom` is
   * (a copy of that project made its own), walking up to the top of the drive; null if none.
   */
  findManifestAbove(filePath: string, projectId: string): Promise<FoundManifest | null>;
}
