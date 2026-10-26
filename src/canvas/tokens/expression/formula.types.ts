/** A plain value a formula reads: a number variable (by id), or a number. */
export type FormulaValue = { kind: "variable"; id: string } | { kind: "number"; value: number };

/** What a step works with: a plain value, or a group (a chain of its own, in parentheses). */
export type FormulaOperand = FormulaValue | { kind: "group"; chain: FormulaChain };

export type FormulaOperator = "+" | "-" | "*" | "/";

/** One step of a formula: what it does to the value so far. */
export interface FormulaStep {
  op: FormulaOperator;
  operand: FormulaOperand;
}

/** A start and steps applied to it left to right (`({a} + {b}) / 34`). */
export interface FormulaChain {
  start: FormulaValue;
  steps: FormulaStep[];
}

/** How a formula's result is rounded: not, to the nearest, down or up. */
export type FormulaRounding = "none" | "round" | "floor" | "ceil";

/**
 * An expression as the visual builder edits it: a chain (whose steps may hold groups), then
 * rounding, then limits. Expressions using other functions are edited as text.
 */
export interface Formula extends FormulaChain {
  rounding: FormulaRounding;
  /** The result is at least this (`max(x, min)`). */
  min: FormulaValue | null;
  /** The result is at most this (`min(x, max)`). */
  max: FormulaValue | null;
}
