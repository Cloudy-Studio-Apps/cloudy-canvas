import type { ErElementBase } from "../base/er.types";

/** One entity (or aggregation) taking part in an ER relation, by id so renames and moves never break it. */
export interface ErParticipant {
  id: string;
  /** An `er-entity` or an `er-aggregate`. */
  entityId: string;
  /** Cardinality, e.g. `0` and `n` for `(0,n)`; both empty when none was given. */
  min: string;
  max: string;
  /** Role name for unary relations (`Empleado (0,1) as jefe`), or empty. */
  role: string;
  /** An arrowhead at the entity end. */
  arrow: boolean;
}

/** An ER relation: a diamond linked to its participants. */
export interface ErRelationElement extends ErElementBase {
  type: "er-relation";
  name: string;
  /** Drawn as a double diamond. */
  identifying: boolean;
  /** Drawn with an "I" bar at the top corner (dependency by identification). */
  idMark: boolean;
  color: string;
  participants: ErParticipant[];
}
