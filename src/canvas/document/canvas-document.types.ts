import type * as Y from "yjs";

import type { CanvasElement } from "../elements";
import type { CanvasDocument } from "./canvas-document";

export type ElementMap = Y.Map<unknown>;

export interface DocumentChange {
  /** Ids added or updated. */
  updated: Set<string>;
  removed: Set<string>;
}

/** What a document says about itself, saved with it: shown instead of the file name when set. */
export interface DocumentMeta {
  /** `""` when the document has no title (its file name is shown). */
  title: string;
  description: string;
}

export type DocumentMetaPatch = Partial<DocumentMeta>;

/** What one edit changed, handed to the document's `AfterEdit` hook. */
export interface EditedChange {
  /** Ids added or whose fields changed. */
  updated: ReadonlySet<string>;
  /** The elements removed, as they were. */
  removed: readonly CanvasElement[];
  /** The fields that changed, by element id, with the values they had before (not added ones). */
  before: ReadonlyMap<string, Readonly<Record<string, unknown>>>;
}

/**
 * Runs after an edit, inside its transaction (and so its undo step), to bring what follows from
 * it up to date (e.g. a design's auto layout). Its own writes run it again with what they
 * changed, until nothing does.
 */
export type AfterEdit = (doc: CanvasDocument, change: EditedChange) => void;
