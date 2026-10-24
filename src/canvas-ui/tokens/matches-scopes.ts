import type { TokenScope, VariableRecord } from "@canvas";

/** Whether a variable may be offered for a field of these scopes (one with no scopes always is). */
export function matchesScopes(variable: VariableRecord, scopes: readonly TokenScope[]): boolean {
  return variable.scopes.length === 0 || variable.scopes.some((scope) => scopes.includes(scope));
}
