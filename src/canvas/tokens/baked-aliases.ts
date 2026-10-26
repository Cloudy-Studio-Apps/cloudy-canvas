import { DEFAULT_VALUE } from "./default-value";
import { resolveVariable } from "./resolve-token";
import { valueRefs } from "./value-refs";
import type { TokenStore } from "./token-store";
import type { ModeContext, TokenValue, VariableRecord } from "./token.types";

/**
 * The variables that alias one of `gone` or read it in an expression (kept ones), with each such
 * value replaced by the value it resolves to now: a mode's value in that mode, the default in its
 * axis's base mode (or, for a variable varying by nothing, in the modes the file shows). An
 * expression that doesn't work out now keeps its text, with the deleted variables' numbers in
 * place of them (0 for one that has none); an alias that doesn't resolve is left as it is.
 */
export function bakedAliases(store: TokenStore, gone: ReadonlySet<string>): VariableRecord[] {
  return store.variables().flatMap((variable) => {
    if (gone.has(variable.id)) return [];
    let changed = false;
    const values: Record<string, TokenValue> = {};
    for (const [key, value] of Object.entries(variable.values)) {
      if (!valueRefs(value).some((ref) => gone.has(ref))) {
        values[key] = value;
        continue;
      }
      const baked =
        bakedValue(store, variable, key) ??
        ("expr" in value
          ? withNumbersFor(store, value.expr, gone, modesOf(store, variable, key))
          : null);
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
  const resolved = resolveVariable(store, variable.id, modesOf(store, variable, key));
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

/** The modes a variable's value at `key` shows in. */
function modesOf(store: TokenStore, variable: VariableRecord, key: string): ModeContext {
  const axis = variable.axisId ? store.axis(variable.axisId) : undefined;
  const mode = key === DEFAULT_VALUE ? axis?.modes[0]?.id : key;
  return axis && mode ? { [axis.id]: mode } : {};
}

/** An expression with each of `gone` replaced by its number in `modes` (0 when it has none). */
function withNumbersFor(
  store: TokenStore,
  expr: string,
  gone: ReadonlySet<string>,
  modes: ModeContext,
): TokenValue {
  return {
    expr: expr.replace(/\{([^}]*)\}/g, (whole, ref: string) => {
      const id = ref.trim();
      if (!gone.has(id)) return whole;
      const value = resolveVariable(store, id, modes);
      return `(${value?.type === "number" ? value.number : 0})`;
    }),
  };
}
