import type { BooleanOperation } from "./boolean.types";
import { t } from "./boolean.i18n";

export const BOOLEAN_TYPE = "boolean";

/** The operations in Figma's order, with their names (a new boolean is named after its own). */
export const BOOLEAN_OPERATIONS: readonly { operation: BooleanOperation; label: string }[] = [
  { operation: "union", label: "Union" },
  { operation: "subtract", label: "Subtract" },
  { operation: "intersect", label: "Intersect" },
  { operation: "exclude", label: "Exclude" },
];

/** An operation's name in the app's language ("Union", "Unión", …): a new boolean is named after it. */
export function operationLabel(operation: BooleanOperation): string {
  return t(`operations.${operation}`);
}

/** An agent's operation, checked. */
export function booleanOperation(value: unknown, field = "operation"): BooleanOperation {
  const entry = BOOLEAN_OPERATIONS.find((item) => item.operation === value);
  if (!entry) {
    const names = BOOLEAN_OPERATIONS.map((item) => item.operation).join(", ");
    throw new Error(`"${field}" must be one of ${names}.`);
  }
  return entry.operation;
}
