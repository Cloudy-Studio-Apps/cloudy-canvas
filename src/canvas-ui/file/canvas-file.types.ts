import type { CanvasDocument } from "@canvas";
import type { FileInfo, FileType, ShareIdentity, ShareRole } from "@shared/core";

export type SaveStatus = "idle" | "saving" | "error";

/** What wrote the file: the user (Save) or autosave. */
export type SaveKind = "manual" | "auto";

/** How a product's documents are stored: its file type, codec and wording. */
export interface CanvasFileFormat {
  type: FileType;
  /**
   * The product in messages, translated: "board" ("The board couldn't be saved"), and in Spanish
   * with its article, "la pizarra" ("No se pudo guardar la pizarra"), so sentences need no gender.
   */
  noun: string;
  /** The name of a file that has none yet, e.g. "Untitled board". */
  untitled: string;
  /** The file's bytes for a document. */
  encode(doc: CanvasDocument): Uint8Array;
}

/** How the loader turns a saved file into a document, or starts a new one. */
export interface CanvasFileSource {
  /** The product in messages and logs, e.g. "board". */
  noun: string;
  /** The document stored in a file's bytes (migrated if needed). Throws for unreadable files. */
  open(bytes: Uint8Array): CanvasDocument;
  /** An empty document, for an id that isn't a saved file (just created from Home). */
  create(): CanvasDocument;
  /**
   * The document of a live session joined as a guest (its Yjs doc comes from the host), instead
   * of a file: nothing is read from storage.
   */
  live?: () => CanvasDocument;
}

export type CanvasFileLoadState =
  | { status: "loading" }
  /** `info` is `null` for a new file that hasn't been saved yet. */
  | { status: "ready"; document: CanvasDocument; info: FileInfo | null }
  | { status: "error"; message: string };

/** The open file, for the editor chrome (`useCanvasFile`). */
export interface CanvasFileContextValue {
  /** The file's id (its key in the recent files). */
  id: string;
  /** The name to show: the document's title, or its file name when it has none. */
  name: string;
  /** The file's name (or the format's `untitled` before it has one), shown when there's no title. */
  fileName: string;
  /** The document's own title (`""` for none), saved in the file. */
  title: string;
  description: string;
  /** What the product calls its documents, e.g. "board". */
  noun: string;
  /** Where the file is saved; `null` until a location is chosen (it may be a draft meanwhile). */
  path: string | null;
  /** Opened without a saved file: one just created from Home (it may have been autosaved since). */
  isNew: boolean;
  /** Autosaved in the app data folder; Save asks where to put it. */
  draft: boolean;
  /** Unsaved changes since the last save (or since opening). */
  dirty: boolean;
  status: SaveStatus;
  /** How the file was just saved, for a few seconds after each save; `null` otherwise. */
  saved: SaveKind | null;
  /** Whether autosave is on. */
  autosave: boolean;
  /** Saves the file (asking where the first time); `false` when cancelled or failed. */
  save: () => Promise<boolean>;
  saveAs: () => Promise<boolean>;
  /** The live session the file is in, `null` when it isn't shared. */
  live: LiveFile | null;
}

/** A file in a live session: shared by this app (`host`), or joined (`guest`). */
export interface LiveFile {
  side: "host" | "guest";
  /** What this app may do: the host always edits. */
  role: ShareRole;
  /** Who hosts it. */
  host: ShareIdentity;
}
