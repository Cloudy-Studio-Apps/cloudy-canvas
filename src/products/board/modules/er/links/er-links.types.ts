import type { Point } from "@canvas";

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
  /** Crow's-foot marks at the `to` end (a binary relation's line), or `null`. */
  crowFoot: CrowFoot | null;
}

/**
 * How many of the entity at this end one of the other end has: read across the relation from the
 * other participant's (min,max) (`Cliente (0,n)` puts a fork at the other entity's end).
 */
export interface CrowFoot {
  /** The mark next to the entity: a bar for one, a fork for many. */
  max: "one" | "many";
  /** The mark further out: a circle for none, a bar for at least one; `null` when not given. */
  min: "zero" | "one" | null;
}

export interface CrowFootStyle {
  color: number | string;
  width: number;
  /** Inside the min circle. */
  fill: number | string;
}
