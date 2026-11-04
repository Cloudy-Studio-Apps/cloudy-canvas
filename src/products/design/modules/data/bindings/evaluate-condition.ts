import { toNumber } from "./coerce";
import { lookup } from "./scope";
import type { DataCondition } from "./binding.types";
import type { DataScope } from "./scope.types";

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function equal(a: unknown, b: unknown): boolean {
  const na = toNumber(a);
  const nb = toNumber(b);
  return na !== null && nb !== null ? na === nb : text(a) === text(b);
}

/** Whether a layer's show condition holds in a scope. An unknown op (a document's, only cast) doesn't hold. */
export function evaluateCondition(condition: DataCondition, scope: DataScope): boolean {
  const value = lookup(scope, condition.path)?.value;
  const other = condition.value;
  switch (condition.op) {
    case "exists":
      return value !== null && value !== undefined;
    case "empty":
      return isEmpty(value);
    case "eq":
      return equal(value, other);
    case "neq":
      return !equal(value, other);
    case "gt":
    case "lt": {
      const a = toNumber(value);
      const b = toNumber(other);
      if (a === null || b === null) return false;
      return condition.op === "gt" ? a > b : a < b;
    }
    case "contains":
      if (Array.isArray(value)) return value.some((v) => equal(v, other));
      return typeof value === "string" && value.includes(text(other));
    default:
      return false;
  }
}
