import type { ElementSide, Point } from "@canvas";

import type { ErAggregateElement } from "../aggregate/aggregate.types";
import type { ErEntityElement } from "../entity/entity.types";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErEdits } from "../model/er-edits";
import type { ErRelationElement } from "../relation/relation.types";

/** ER elements with connect dots: entities, relations and hierarchies. */
export type ErConnectSource = ErEntityElement | ErRelationElement | ErIsaElement;

/** What a relation can take part with: an entity or an aggregation. */
export type ErParticipantTarget = ErEntityElement | ErAggregateElement;

/** Where the element's side is, for its dot. */
export type ErAnchorOf = (side: ElementSide) => Point;

/** What dropping a connect dot does; `run` makes the edit and returns what to select. */
export interface ErConnectOutcome {
  run: () => string | undefined;
  /** It opens a prompt rather than editing (whatever joining it needs happens when answered). */
  prompts?: boolean;
}

/** A connect dot dropped on empty board, waiting for the user to pick what to create there. */
export interface ErQuickAddRequest {
  sourceId: string;
  /** World point of the drop. */
  at: Point;
}

/** One choice of the quick-add menu: what it creates from the source at the drop point. */
export interface ErQuickAddOption {
  id: string;
  label: string;
  /** Makes the edit (one undo step) and returns the new shape's id. */
  run: (edits: ErEdits, at: Point) => string | undefined;
}

/** Two elements a connect dot linked, waiting for the kind of relation between them. */
export interface ErRelationRequest {
  fromId: string;
  /** An entity or an aggregation. */
  toId: string;
  /** Where the relation goes (halfway between them). */
  at: Point;
}

export type ErRelationRatioId = "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

/** A side of a relation as the picker shows it: one or many. */
export type ErRelationSide = "one" | "many";

/** A kind of binary relation: its cardinalities and the ends whose attribute the other joins. */
export interface ErRelationRatio {
  id: ErRelationRatioId;
  label: string;
  /** How many of each side one of the other has (the glyph's ends). */
  from: ErRelationSide;
  to: ErRelationSide;
  /** Chen (min,max) participation of each end. */
  fromCardinality: { min: string; max: string };
  toCardinality: { min: string; max: string };
  /** Ends the other one links to, which are asked for their join attribute. */
  joins: readonly ("from" | "to")[];
  /** Says it with the names, e.g. "Each Cliente has many Pedido". */
  describe: (from: string, to: string) => string;
}
