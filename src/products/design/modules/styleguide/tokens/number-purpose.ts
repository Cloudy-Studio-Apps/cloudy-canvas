import type { TokenScope, VariableRecord } from "@canvas";

import type { NumberPurpose } from "./number-purpose.types";

/** The scopes that make each purpose, first match wins. */
const PURPOSES: readonly [NumberPurpose, readonly TokenScope[]][] = [
  ["spacing", ["gap", "padding"]],
  ["radius", ["corner-radius"]],
  ["font", ["font-size"]],
  ["opacity", ["opacity"]],
  ["stroke", ["stroke-weight"]],
];

/** What a number variable is for (a variable for every field is `other`). */
export function numberPurposeOf(variable: VariableRecord): NumberPurpose {
  const scopes = new Set(variable.scopes);
  return PURPOSES.find(([, of]) => of.some((scope) => scopes.has(scope)))?.[0] ?? "other";
}
