import type { TokenStore, VariableRecord } from "@canvas";

import { variableGroups } from "../sheet";
import type { SheetGroup } from "../styleguide.types";
import { numberPurposeOf, type NumberPurpose } from "../tokens";

/** The groups of the variables `take` accepts. */
export function variables(
  store: TokenStore,
  take: (variable: VariableRecord) => boolean,
): SheetGroup[] {
  return variableGroups(store.variables().filter(take), store);
}

/** The groups of the number variables for `purpose`. */
export function numbers(store: TokenStore, purpose: NumberPurpose): SheetGroup[] {
  return variables(store, (v) => v.type === "number" && numberPurposeOf(v) === purpose);
}

/** A text variable naming a font family or a face (Typography shows those). */
export function isFontVariable(variable: VariableRecord): boolean {
  return (
    variable.type === "string" &&
    variable.scopes.some((scope) => scope === "font-family" || scope === "font-style")
  );
}
