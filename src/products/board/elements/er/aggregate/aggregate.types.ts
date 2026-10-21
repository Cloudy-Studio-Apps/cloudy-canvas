import type { ErElementBase } from "../base/er.types";

/**
 * An aggregation: a box around a relation and its participants that takes part in other relations
 * like an entity. Its bounds are derived from those elements whenever the board changes.
 */
export interface ErAggregateElement extends ErElementBase {
  type: "er-aggregate";
  name: string;
  relationId: string;
}
