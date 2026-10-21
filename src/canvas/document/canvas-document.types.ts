import type * as Y from "yjs";

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
