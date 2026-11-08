import type * as Y from "yjs";

import type { CanvasElement } from "../elements";
import type { CanvasDocument } from "./canvas-document";

export type ElementMap = Y.Map<unknown>;

export interface DocumentChange {
  /** Ids added or updated. */
  updated: Set<string>;
  removed: Set<string>;
  /**
   * The fields each updated element changed, `"all"` for an added (or replaced) one. Missing when
   * the change didn't come from the document (e.g. `engine.refreshElements`): treat it as all.
   */
  fields?: ReadonlyMap<string, ReadonlySet<string> | "all">;
}

/** What a document says about itself, saved with it: shown instead of the file name when set. */
export interface DocumentMeta {
  /** `""` when the document has no title (its file name is shown). */
  title: string;
  description: string;
}

export type DocumentMetaPatch = Partial<DocumentMeta>;

/** The project a file belongs to and which of its libraries the file uses. */
export interface ProjectLink {
  projectId: string;
  /** The libraries used by id, or `"all"` (every library, including ones added later). */
  libraryIds: string[] | "all";
}

/** How `CanvasDocument.setProjectLink` writes the link. */
export interface ProjectLinkOptions {
  /**
   * Writes it as the current actor (the user), so it joins the undo step being recorded: the
   * file's libraries menu, whose undo restores the link with the records it took out. Otherwise
   * (the default) it's outside every undo history.
   */
  undoable?: boolean;
}

/** Who changed token records, handed to `CanvasDocument.observeTokens` listeners. */
export interface TokenChangeSource {
  /**
   * Made here by the user, an agent, or undo/redo: not an untracked write (`UI_ORIGIN`, e.g. a
   * project library's mirror or a migration) and not a remote update.
   */
  local: boolean;
  /** Applied from another peer (a live session's guest or host). */
  remote: boolean;
  /** Each changed record's value before the change (`undefined` for one just added). */
  previous: ReadonlyMap<string, unknown>;
}

/** What one edit changed, handed to the document's `AfterEdit` hook. */
export interface EditedChange {
  /** Ids added or whose fields changed. */
  updated: ReadonlySet<string>;
  /** The elements removed, as they were. */
  removed: readonly CanvasElement[];
  /** The fields that changed, by element id, with the values they had before (not added ones). */
  before: ReadonlyMap<string, Readonly<Record<string, unknown>>>;
  /** The token records (variables, collections) written or removed. */
  tokens: ReadonlySet<string>;
  /** Whether the document's title or description changed. */
  meta: boolean;
}

/**
 * Runs after an edit, inside its transaction (and so its undo step), to bring what follows from
 * it up to date (e.g. a design's auto layout). Its own writes run it again with what they
 * changed, until nothing does.
 */
export type AfterEdit = (doc: CanvasDocument, change: EditedChange) => void;

/** What `add` does to a new element before storing it (e.g. places it in a scope). */
export type Placement = (el: CanvasElement) => CanvasElement;

/**
 * Who an edit is by, for the duration of `CanvasDocument.runAs`: its transaction origin (which
 * undo history records it) and where new elements go (`null`: the document's own placement).
 */
export interface DocumentActor {
  origin: symbol;
  placement: Placement | null;
}

/** Where an element of a type that isn't registered sits (see `CanvasDocument.unregistered`). */
export interface UnregisteredElement {
  id: string;
  type: string;
  index: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
