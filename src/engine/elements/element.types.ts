import type { GeoElement } from "./geo/geo.types";
import type { StickyElement } from "./sticky/sticky.types";
import type { StrokeElement } from "./stroke/stroke.types";

/** Every element type the board knows. Each has a folder in `elements/` and a kind in the registry. */
export type ElementType = "sticky" | "stroke" | "geo";

/**
 * What every element on the canvas is. Elements are plain data (they live in the Yjs doc); their
 * behavior lives in the `ElementKind` registered for their `type`.
 */
export interface CanvasElement {
  id: string;
  type: ElementType;
  /** Fractional index (fractional-indexing): lexicographic order is z-order. */
  index: string;
  /** Top-left corner in world coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AnyElement = StickyElement | StrokeElement | GeoElement;

/** The element interface for one type, e.g. `ElementOf<"geo">` is `GeoElement`. */
export type ElementOf<K extends ElementType> = Extract<AnyElement, { type: K }>;

/** Fields that can be changed after creation (id and type are immutable). */
export type ElementPatch = Partial<Omit<StickyElement, "id" | "type">> &
  Partial<Omit<StrokeElement, "id" | "type">> &
  Partial<Omit<GeoElement, "id" | "type">>;
