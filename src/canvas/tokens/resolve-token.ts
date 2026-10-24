import { parseTokenColor } from "./token-color";
import type { TokenStore } from "./token-store";
import { DEFAULT_VALUE } from "./default-value";
import type {
  ModeAxisRecord,
  ModeContext,
  ResolvedValue,
  TokenValue,
  VariableRecord,
} from "./token.types";

/** How many aliases a chain may follow before it's taken as broken. */
const MAX_HOPS = 16;

/** The mode of an axis that applies in `modes`: the one picked, else the file's, else the base. */
export function modeFor(axis: ModeAxisRecord, modes: ModeContext): string {
  for (const picked of [modes[axis.id], axis.current]) {
    if (picked && axis.modes.some((mode) => mode.id === picked)) return picked;
  }
  return axis.modes[0]?.id ?? "";
}

/**
 * A variable's raw value in `modes` (aliases not followed): its override for its axis's mode,
 * else its default.
 */
export function valueIn(store: TokenStore, id: string, modes: ModeContext): TokenValue | null {
  const variable = store.variable(id);
  if (!variable) return null;
  const fallback = variable.values[DEFAULT_VALUE] ?? null;
  const axis = variable.axisId ? store.axis(variable.axisId) : undefined;
  if (!axis) return fallback;
  return variable.values[modeFor(axis, modes)] ?? fallback;
}

/**
 * A variable's value for a layer whose modes are `modes`: aliases are followed, each by its own
 * axis. `null` when it's missing, its chain loops or breaks, or a value's type
 * doesn't match the variable's (a layer then keeps what it shows).
 */
export function resolveVariable(
  store: TokenStore,
  id: string,
  modes: ModeContext,
): ResolvedValue | null {
  const style = store.style(id);
  if (style) return { type: "style", styleType: style.styleType, value: style.value };
  const type = store.variable(id)?.type;
  if (!type) return null;
  const seen = new Set<string>();
  let current = id;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (seen.has(current)) return null;
    seen.add(current);
    const value = valueIn(store, current, modes);
    if (!value) return null;
    if ("alias" in value) {
      if (store.variable(value.alias)?.type !== type) return null;
      current = value.alias;
      continue;
    }
    if (type === "color" && "color" in value) {
      const color = parseTokenColor(value.color);
      return color ? { type, color } : null;
    }
    if (type === "number" && "number" in value) return { type, number: value.number };
    return null;
  }
  return null;
}

/** Whether making `variableId` an alias of `targetId` would make a chain loop. */
export function aliasCreatesCycle(
  store: TokenStore,
  variableId: string,
  targetId: string,
): boolean {
  return targetId === variableId || store.aliasDependents(variableId).has(targetId);
}

/** Where a value for `mode` is kept on variables: the default for an axis's base mode, else the mode. */
export function valueKeyOf(store: TokenStore, mode: string): string {
  if (mode === DEFAULT_VALUE) return DEFAULT_VALUE;
  const axis = store.axes().find((a) => a.modes.some((m) => m.id === mode));
  return !axis || axis.modes[0]?.id === mode ? DEFAULT_VALUE : mode;
}

/** Whether a variable has any value besides its default (it varies by its axis). */
export function hasOverrides(variable: VariableRecord): boolean {
  return Object.keys(variable.values).some((key) => key !== DEFAULT_VALUE);
}
