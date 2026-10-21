import type { Point, Rect } from "../../geometry.types";

/** Shape id → center point, in world units. */
export type Centers = Map<string, Point>;

/** Spacing of the entity grid, worked out from the sizes in the model. */
export interface LayoutMetrics {
  pitchX: number;
  pitchY: number;
  /** Room an entity's attributes take on each side. */
  ringX: number;
  ringY: number;
}

/** A grid cell (column, row) of the entity grid. */
export interface Cell {
  c: number;
  r: number;
}

/** What new attributes must keep clear of: placed boxes and drawn lines. */
export interface Obstacles {
  rects: Rect[];
  segments: [Point, Point][];
}

/** Hierarchy links between entities: child → parent, and parent → children in text order. */
export interface Hierarchy {
  parentOf: Map<string, string>;
  childrenOf: Map<string, string[]>;
}
