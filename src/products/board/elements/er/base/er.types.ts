import type { CanvasElement, ElementDefaults } from "@canvas";

import type { ErAggregateElement } from "../aggregate/aggregate.types";
import type { ErAttributeElement } from "../attribute/attribute.types";
import type { ErConstraintElement } from "../constraint/constraint.types";
import type { ErEntityElement } from "../entity/entity.types";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErRelationElement } from "../relation/relation.types";

/**
 * The ER diagram an element belongs to. A board can hold several; each has its own text, layout
 * and names. The name is repeated on every element of the diagram (and kept in step by
 * `applyErPlan`).
 */
export interface ErDiagramFields {
  diagram: string;
  diagramName: string;
}

/** What every ER element has: its place on the board and its diagram. */
export type ErElementBase = CanvasElement & ErDiagramFields;

export type ErElement =
  | ErEntityElement
  | ErRelationElement
  | ErAttributeElement
  | ErIsaElement
  | ErAggregateElement
  | ErConstraintElement;

/** ER elements whose name is edited in place. */
export type ErNamedElement =
  ErEntityElement | ErRelationElement | ErAttributeElement | ErAggregateElement;

export interface ErDefaults extends ElementDefaults {
  fontSize: number;
  strokeWidth: number;
  /** Space between the two outlines of doubled shapes (weak entities, identifying relations…). */
  doubleGap: number;
  /** Height of the name strip at the top of an aggregation box. */
  aggregateTitleHeight: number;
}
