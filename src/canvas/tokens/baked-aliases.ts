import { DEFAULT_VALUE } from "./default-value";
import { resolveVariable } from "./resolve-token";
import type { TokenStore } from "./token-store";
import type { ModeContext, TokenValue, VariableRecord } from "./token.types";

/**
 * The variables that alias one of `gone` (kept ones), with each such value replaced by the value
 * it resolves to now: a mode's value in that mode, the default in its axis's base mode (or, for a
 * variable varying by nothing, in the modes the file shows). What can't be resolved is left out.
 */
export function bakedAliases(store: TokenStore, gone: ReadonlySet<string>): VariableRecord[] {
  return store.variables().flatMap((variable) => {
    if (gone.has(variable.id)) return [];
    let changed = false;
    const values: Record<string, TokenValue> = {};
    for (const [key, value] of Object.entries(variable.values)) {
      if (!("alias" in value) || !gone.has(value.alias)) {
        values[key] = value;
        continue;
      }
      const baked = bakedValue(store, variable, key);
      if (baked) {
        values[key] = baked;
        changed = true;
      } else values[key] = value;
    }
    return changed ? [{ ...variable, values }] : [];
  });
}

/** What a variable's value at `key` resolves to, as a plain value (`null` when it doesn't). */
function bakedValue(store: TokenStore, variable: VariableRecord, key: string): TokenValue | null {
  const axis = variable.axisId ? store.axis(variable.axisId) : undefined;
  const mode = key === DEFAULT_VALUE ? axis?.modes[0]?.id : key;
  const modes: ModeContext = axis && mode ? { [axis.id]: mode } : {};
  const resolved = resolveVariable(store, variable.id, modes);
  switch (resolved?.type) {
    case "color":
      return { color: resolved.color };
    case "number":
      return { number: resolved.number };
    case "string":
      return { string: resolved.string };
    case "boolean":
      return { boolean: resolved.boolean };
    default:
      return null;
  }
}
