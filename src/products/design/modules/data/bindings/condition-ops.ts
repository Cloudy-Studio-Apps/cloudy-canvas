import type { ConditionOp } from "./binding.types";

/** Every show condition's op, in the order pickers list them. */
export const CONDITION_OPS: readonly ConditionOp[] = [
  "exists",
  "empty",
  "eq",
  "neq",
  "gt",
  "lt",
  "contains",
];

/** The ops that compare with a value (the rest read the field alone). */
export function opTakesValue(op: ConditionOp): boolean {
  return op !== "exists" && op !== "empty";
}
