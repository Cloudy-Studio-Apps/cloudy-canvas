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
