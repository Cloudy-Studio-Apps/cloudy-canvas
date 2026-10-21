import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds } from "../elements";
import type { CopyContext } from "./clone-elements.types";

/** Where `insertCopies` adds copies, and the product's fixes for them. */
export interface CopyTarget {
  readonly doc: CanvasDocument;
  readonly kinds: ElementKinds;
  /** The scene's elements, before the copies are added. */
  readonly existing: readonly CanvasElement[];
  prepare?(copies: CanvasElement[], context: CopyContext): CanvasElement[];
}
