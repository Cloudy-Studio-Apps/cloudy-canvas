import type { ShapeType } from "../document";

/** A compact view of a shape for listings; `get_shapes` returns the full fields. */
export interface ShapeSummary {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Text, title or name, when the shape has one. */
  label?: string;
  /** The ER diagram an ER shape belongs to. */
  diagram?: string;
  /** Geo kind. */
  kind?: string;
  /** Connector ends attached to shapes. */
  from?: string | null;
  to?: string | null;
}
