/**
 * What a part of an expression is in CSS: a length, a plain number, or a literal that can be
 * either (it takes `px` where a length is needed).
 */
export type CalcKind = "length" | "number" | "free";
