import type { Point } from "../geometry.types";

/** A line of the ER diagram, clipped to the outlines of the shapes at its ends. */
export interface ErLink {
  /** The relation, attribute or hierarchy the line leaves from. */
  fromId: string;
  /** The entity (or aggregation), the attribute's owner, or a hierarchy's parent or child. */
  toId: string;
  /** Polyline from the `from` shape to the `to` shape. */
  points: Point[];
  /** Cardinality like `(0,n)` shown near the `to` end, or empty. */
  label: string;
  labelAt: Point | null;
  /** An arrowhead at the `to` end. */
  arrow: boolean;
  /** A small circle halfway along (a total hierarchy). */
  totalMark: boolean;
}
