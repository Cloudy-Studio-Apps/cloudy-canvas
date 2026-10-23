import type { CanvasElement, ElementDefaults } from "@canvas";

import type { ErAggregateElement } from "../aggregate/aggregate.types";
import type { ErAttributeElement } from "../attribute/attribute.types";
import type { ErConstraintElement } from "../constraint/constraint.types";
import type { ErEntityElement } from "../entity/entity.types";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErRelationElement } from "../relation/relation.types";
import type { ErUnionElement } from "../union/union.types";

/**
 * The ER diagram an element belongs to. A board can hold several; each has its own text, layout
 * and names. The name is repeated on every element of the diagram (and kept in step by
 * `applyErPlan`).
 */
export interface ErDiagramFields {
  diagram: string;
  diagramName: string;
  /** How the diagram is drawn (the `Diagram [notation: …]` line); repeated like the name. */
  notation: ErNotation;
}

/**
 * A standard's id (a textbook or paper a diagram follows; see `ErStandardDefinition`). Built-ins
 * are `cloudy` (the default), `chen`, `elmasri`, `silberschatz` and `piattini`; plugins add more.
 */
export type ErStandard = string;

/** Every drawing choice a diagram's notation makes. */
export interface ErNotationSettings {
  /** The lines' labels: `(min,max)`, or Chen's 1 / N / M (the diamond's ratio is left out then). */
  cardinality: "minmax" | "ratio";
  /**
   * How the diamond's `1:N` is read: `across` from the other side's maximum, like the crow's feet
   * (two-way relations only), or `own` from each side's own (the board's first reading).
   */
  ratio: "own" | "across";
  /** `(min,max)` labels, a double line where the minimum is at least 1, or both. */
  participation: "numbers" | "lines" | "both";
  /**
   * A hierarchy as a triangle with an arc when exclusive, a circle with "d" or "o", or a hollow
   * arrow up to the parent ("disjoint" beside it when exclusive).
   */
  isa: "arc" | "circle" | "arrow";
  /**
   * Arrowheads: only where a participant asks for one (`[arrow]`), or also, on two-way relations,
   * at an entity the other side takes part with at most once.
   */
  arrows: "manual" | "cardinality";
  /** The join attribute after the cardinality on the lines (`(0,n) · dni`), or not. */
  joins: "shown" | "hidden";
  /** Crow's-foot marks on two-way relations. */
  crowFeet: boolean;
  /** The "I" (identification) and "E" (existence) dependency marks on relations, or none. */
  dependency: "marks" | "none";
}

/** A diagram's notation as written: a standard (default `cloudy`) and the settings it overrides. */
export interface ErNotation extends Partial<ErNotationSettings> {
  standard?: ErStandard;
}

/** What every ER element has: its place on the board and its diagram. */
export type ErElementBase = CanvasElement & ErDiagramFields;

export type ErElement =
  | ErEntityElement
  | ErRelationElement
  | ErAttributeElement
  | ErIsaElement
  | ErAggregateElement
  | ErConstraintElement
  | ErUnionElement;

/** What takes part in a relation (see `isErParticipant`; only associative relations). */
export type ErParticipantElement = ErEntityElement | ErAggregateElement | ErRelationElement;

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
