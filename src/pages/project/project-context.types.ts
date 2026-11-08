import type { RowDrag } from "@canvas-ui";
import type {
  FileInfo,
  FileType,
  ProjectEntry,
  ProjectManifest,
  ProjectRecord,
} from "@shared/core";
import type { UseProject } from "./use-project.types";

export interface ProjectActions {
  /** Opens a board or design in its editor. */
  open: (entry: ProjectEntry) => Promise<void>;
  /** Makes a unique "New folder" inside `parent` and returns its path; null when it failed. */
  createFolder: (parent: string) => Promise<string | null>;
  /** Renames a file (its extension stays) or folder. */
  rename: (entry: ProjectEntry, name: string) => Promise<void>;
  /** Moves a file or folder into `toFolder`; the folder it is in already is a no-op. */
  move: (rel: string, toFolder: string, isFolder: boolean) => Promise<void>;
  duplicate: (entry: ProjectEntry) => Promise<void>;
  reveal: (rel: string) => Promise<void>;
  /** Opens a new board or design that will be saved in `folder`. */
  newFile: (type: FileType, folder: string) => void;
  /** Sets a folder's color; null resets it. */
  setFolderColor: (rel: string, color: string | null) => Promise<void>;
}

export interface ProjectContextValue {
  /** The project's record and manifest, read. */
  record: ProjectRecord;
  manifest: ProjectManifest;
  project: UseProject;
  /** The folder open in the Files tab (`""` is the root). */
  folder: string;
  setFolder: (rel: string) => void;
  /** Changes whenever files moved, so scans read again. */
  scanRev: number;
  bump: () => void;
  /** The folder or file being renamed in place (its path). */
  renaming: string | null;
  setRenaming: (rel: string | null) => void;
  /** The file or folder the Move to… dialog is open for. */
  moving: ProjectEntry | null;
  setMoving: (entry: ProjectEntry | null) => void;
  /** Dragging files and folders onto folders: ids are `file:<rel>` / `folder:<rel>`. */
  drag: RowDrag;
  actions: ProjectActions;
  /** What is known of a board or design: its recent-files entry, or a stand-in. */
  infoFor: (entry: ProjectEntry) => FileInfo;
  /** The project's newest files. */
  recent: FileInfo[];
}
