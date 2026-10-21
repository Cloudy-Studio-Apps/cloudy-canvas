import type { CanvasElement } from "../elements";

export interface ClonedElements {
  /** The copies, bottom to top, with new ids and indexes and references remapped. */
  copies: CanvasElement[];
  /** Original id → copy id. */
  ids: Map<string, string>;
}

/** What a product's `prepareCopies` gets besides the copies. */
export interface CopyContext {
  /** Ids of the copies. A reference to any other id points at an element that wasn't copied. */
  readonly copied: ReadonlySet<string>;
  /** The scene's elements (derived geometry resolved), before the copies are added. */
  readonly existing: readonly CanvasElement[];
}
