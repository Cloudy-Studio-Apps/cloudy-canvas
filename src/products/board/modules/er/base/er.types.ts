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
  /** How the diagram is drawn (the `Diagram [notation: …]` line); repeated like the name. */
  notation: ErNotation;
}

/**
 * The standards (textbooks or papers) a diagram can follow; each sets the notation's drawing
 * choices and the constructs it has. `cloudy` (the board's own mix) is the default.
 */
export type ErStandard = "cloudy" | "chen" | "elmasri" | "silberschatz" | "piattini";

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
  /** A hierarchy as a triangle with an arc when exclusive, or a circle with "d" or "o". */
  isa: "arc" | "circle";
  /** Crow's-foot marks on two-way relations. */
  crowFeet: boolean;
}

/** A diagram's notation as written: a standard (default `cloudy`) and the settings it overrides. */
export interface ErNotation extends Partial<ErNotationSettings> {
  standard?: ErStandard;
}

/** The constructs of the extended model a standard has (the Check diagram reports others). */
export interface ErStandardSupports {
  hierarchies: boolean;
  aggregations: boolean;
  constraints: boolean;
}

/** A standard: where it comes from and how it draws. */
export interface ErStandardInfo {
  id: ErStandard;
  label: string;
  /** The book or paper, as cited. */
  citation: string;
  /** Where to read it (a publisher's page, a library record or the paper), or `null`. */
  url: string | null;
  /** Its drawing settings were taken from secondary sources and may differ in details. */
  approximate: boolean;
  /** What it's known for, in a sentence. */
  summary: string;
  settings: ErNotationSettings;
  supports: ErStandardSupports;
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
