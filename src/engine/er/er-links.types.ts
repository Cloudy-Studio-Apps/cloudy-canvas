import type { Point } from "../geometry.types";

/** A line of the ER diagram, clipped to the outlines of the shapes at its ends. */
export interface ErLink {
  /** The relation (for participants) or the attribute. */
  fromId: string;
  /** The entity (for participants) or the attribute's owner. */
  toId: string;
  from: Point;
  to: Point;
  /** `(min,max)` shown near the entity end, or empty. */
  label: string;
  labelAt: Point | null;
}
