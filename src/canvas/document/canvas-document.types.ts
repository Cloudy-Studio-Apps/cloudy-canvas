import type * as Y from "yjs";

export type ElementMap = Y.Map<unknown>;

export interface DocumentChange {
  /** Ids added or updated. */
  updated: Set<string>;
  removed: Set<string>;
}
