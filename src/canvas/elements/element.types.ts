/**
 * What every element on the canvas is. Elements are plain data (they live in the Yjs doc); their
 * behavior lives in the `ElementKind` registered for their `type`. The set of types is open:
 * built-ins and plugins register kinds at runtime, so code outside an element's folder never
 * assumes which types exist.
 */
export interface CanvasElement {
  id: string;
  /** Key of the element's kind in the registry, e.g. `"sticky"`. */
  type: string;
  /** Fractional index (fractional-indexing): lexicographic order is z-order. */
  index: string;
  /** Top-left corner in world coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Changes to an element's fields (id and type are immutable). Kinds type them for their element
 * (`ElementPatch<StickyElement>`); the document takes any of them as the base `ElementPatch`.
 */
export type ElementPatch<E extends CanvasElement = CanvasElement> = Partial<Omit<E, "id" | "type">>;
