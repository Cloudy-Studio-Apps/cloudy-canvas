import type { RowDrag } from "@canvas-ui";
import type {
  FileInfo,
  FileType,
  ProjectEntry,
  ProjectManifest,
  ProjectRecord,
  TrashEntry,
} from "@shared/core";
import type { LibraryKind } from "./libraries/library-kinds.types";
import type { LibraryActions } from "./libraries/use-library-actions.types";
import type { ProjectLibraryDocs } from "./libraries/use-project-library-docs.types";
import type { ProjectTab } from "./components/project-tabs.types";
import type { UseProject } from "./use-project.types";
import type { ProjectTrash } from "./use-project-trash.types";

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
  /** Moves a file or folder to the project's trash; it is forgotten from the recent files. */
  trash: (entry: ProjectEntry) => Promise<void>;
  /** Puts a trashed item back where it was. */
  restore: (entry: TrashEntry) => Promise<void>;
  /** Deletes everything in the trash for good. */
  emptyTrash: () => Promise<void>;
  /** Sets a folder's color; null resets it. */
  setFolderColor: (rel: string, color: string | null) => Promise<void>;
}

/** Moving between a library's page and a kind's view (the URL's `library` and `kind`). */
export interface ProjectNav {
  /** The Libraries tab: one library's page, or `null` for all of them. */
  openLibrary: (id: string | null) => void;
  /** The Content view of one kind across the libraries. */
  openKind: (kind: LibraryKind) => void;
}

export interface ProjectContextValue {
  /** The project's record and manifest, read. */
  record: ProjectRecord;
  manifest: ProjectManifest;
  project: UseProject;
  /** The tab shown (the URL's `tab`; Files without one). */
  tab: ProjectTab;
  setTab: (tab: ProjectTab) => void;
  /** The library open on the Libraries tab, if any (`?library=`). */
  libraryId: string | null;
  /** The kind shown on the Content view (`?kind=`). */
  kind: LibraryKind | null;
  nav: ProjectNav;
  /** The project's libraries, read while the home is shown. */
  libs: ProjectLibraryDocs;
  libraryActions: LibraryActions;
  /** The New library dialog is open. */
  newLibraryOpen: boolean;
  setNewLibraryOpen: (open: boolean) => void;
  /** How many boards and designs the project holds, `null` while counted. */
  fileCount: number | null;
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
  /** What waits in the project's trash. */
  trash: ProjectTrash;
}
