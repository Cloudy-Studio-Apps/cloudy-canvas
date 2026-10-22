import type { CanvasDocument } from "../document";

/**
 * Something one engine shares with everyone who uses it (a facade over its document, like a
 * board's database schema), as a typed token. `engine.service(def)` creates it on first use and
 * returns the same one afterwards. It must need no cleanup (e.g. observe the document through a
 * `DocumentFeed`).
 */
export interface ServiceDef<T> {
  /** Unique, e.g. `"board.dbSchema"`. */
  readonly id: string;
  create(doc: CanvasDocument): T;
}
