import type { TokenScope, VariableRecord } from "@canvas";

/**
 * Whether a variable may be offered for a field of these scopes: a variable with no scopes fits
 * every field, and a field with none (an alias, an expression, Replace with…) takes every
 * variable of its type.
 */
export function matchesScopes(variable: VariableRecord, scopes: readonly TokenScope[]): boolean {
  return (
    scopes.length === 0 ||
    variable.scopes.length === 0 ||
    variable.scopes.some((scope) => scopes.includes(scope))
  );
}
