import { expressionRefs, mapExpressionRefs } from "./expression";
import type { TokenValue } from "./token.types";

/** Whether a value is an expression. */
export function isExpressionValue(value: TokenValue): value is { expr: string } {
  return "expr" in value;
}

/** The variables a value reads: an alias's target, an expression's references; none for raw. */
export function valueRefs(value: TokenValue): string[] {
  if ("alias" in value) return [value.alias];
  if ("expr" in value) return expressionRefs(value.expr);
  return [];
}

/** The value with the variables it reads renamed by `map` (raw values are returned as they are). */
export function mapValueRefs(value: TokenValue, map: (id: string) => string): TokenValue {
  if ("alias" in value) return { alias: map(value.alias) };
  if ("expr" in value) return { expr: mapExpressionRefs(value.expr, map) };
  return value;
}
