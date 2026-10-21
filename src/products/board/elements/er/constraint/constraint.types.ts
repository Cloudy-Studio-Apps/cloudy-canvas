import type { ErElementBase } from "../base/er.types";

export type ErConstraintRule = "exclusive" | "inclusive" | "exclusion" | "inclusion";

/**
 * A constraint between two relations. Exclusive and inclusive ones are about how one entity takes
 * part in both; inclusion and inclusive ones point from `fromId` (the requirement) to `toId`.
 * Its bounds and `points` are derived from the elements it connects.
 */
export interface ErConstraintElement extends ErElementBase {
  type: "er-constraint";
  rule: ErConstraintRule;
  /** The entity, for exclusive and inclusive constraints; otherwise empty. */
  entityId: string;
  fromId: string;
  toId: string;
  /** Cardinality of an inclusive constraint, e.g. `(2,n)`; otherwise empty. */
  min: string;
  max: string;
  /** Resolved drawing, relative to (x, y): see `model/resolve-er.ts`. */
  points: number[];
}
