import type { CanvasElement } from "@canvas";

/** What `renamedReferences` reads: the document's layers, or pasted ones not yet added. */
export interface RenameView {
  /** A layer's parent id, `null` at the top or when unknown. */
  parentOf(id: string): string | null;
  /** A layer whole; it may answer only for layers holding a `repeat` (the only ones it needs). */
  get(id: string): CanvasElement | undefined;
  /** The layers to rename in. */
  under: readonly CanvasElement[];
}
