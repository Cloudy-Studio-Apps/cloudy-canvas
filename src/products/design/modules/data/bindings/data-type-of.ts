import type { FieldType } from "../source";
import { lookup } from "./scope";
import type { DataScope } from "./scope.types";

const COUNT = ".$count";

/** The data type an expression reads: its field's, `integer` for a row count, `null` unknown. */
export function dataTypeOf(scope: DataScope, expr: string): FieldType | null {
  const found = lookup(scope, expr);
  if (!found) return null;
  if (found.field) return found.field.type;
  return expr.endsWith(COUNT) && typeof found.value === "number" ? "integer" : null;
}
