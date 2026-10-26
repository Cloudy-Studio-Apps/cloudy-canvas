import { parseTokenColor } from "./token-color";
import type { TokenStore } from "./token-store";
import { DEFAULT_VALUE } from "./default-value";
import { resolveStyle } from "./resolve-style";
import type {
  ModeAxisRecord,
  ModeContext,
  ResolvedValue,
  TokenValue,
  VariableRecord,
  VariableType,
} from "./token.types";
import { evaluateExpression, parsedExpression } from "./expression";
import type { ResolveRun } from "./resolve-token.types";

/** How many aliases a chain may follow before it's taken as broken. */
const MAX_HOPS = 16;
/** How many variables an expression may reach through others before it's taken as broken. */
const MAX_DEPTH = 64;

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
 * A variable's value for a layer whose modes are `modes`: aliases are followed and expressions
 * worked out, each reference by its own axis. `null` when it's missing, its chain loops or breaks,
 * an expression doesn't work out, or a value's type doesn't match the variable's (a layer then
 * keeps what it shows).
 */
export function resolveVariable(
  store: TokenStore,
  id: string,
  modes: ModeContext,
): ResolvedValue | null {
  const style = store.style(id);
  if (style) {
    return { type: "style", styleType: style.styleType, value: resolveStyle(store, style, modes) };
  }
  return resolveIn(store, id, modes, { visiting: new Set(), done: new Map() });
}

/**
 * `resolveVariable` for a variable within one call: `visiting` holds the variables being worked
 * out (meeting one again is a loop) and `done` what's worked out already, so a variable several
 * expressions read is worked out once (a loop's `null` included: what meets the stack is in it).
 */
function resolveIn(
  store: TokenStore,
  id: string,
  modes: ModeContext,
  run: ResolveRun,
): ResolvedValue | null {
  const known = run.done.get(id);
  if (known !== undefined) return known;
  const { visiting } = run;
  const type = store.variable(id)?.type;
  if (!type) return null;
  const chain: string[] = [];
  let current = id;
  let result: ResolvedValue | null = null;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (visiting.has(current) || visiting.size > MAX_DEPTH) break;
    visiting.add(current);
    chain.push(current);
    const value = valueIn(store, current, modes);
    if (!value) break;
    if ("alias" in value) {
      if (store.variable(value.alias)?.type !== type) break;
      current = value.alias;
      continue;
    }
    result = rawResolved(store, type, value, modes, run);
    break;
  }
  for (const visited of chain) visiting.delete(visited);
  run.done.set(id, result);
  return result;
}

/** A value that isn't an alias as the resolved value of a variable of `type`. */
function rawResolved(
  store: TokenStore,
  type: VariableType,
  value: Exclude<TokenValue, { alias: string }>,
  modes: ModeContext,
  run: ResolveRun,
): ResolvedValue | null {
  if ("expr" in value) {
    if (type !== "number") return null;
    const tree = parsedExpression(value.expr);
    if (!tree) return null;
    const number = evaluateExpression(tree, (ref) => {
      if (store.variable(ref)?.type !== "number") return null;
      const resolved = resolveIn(store, ref, modes, run);
      return resolved?.type === "number" ? resolved.number : null;
    });
    return number === null ? null : { type, number };
  }
  if (type === "color" && "color" in value) {
    const color = parseTokenColor(value.color);
    return color ? { type, color } : null;
  }
  if (type === "number" && "number" in value) return { type, number: value.number };
  if (type === "string" && "string" in value) return { type, string: value.string };
  if (type === "boolean" && "boolean" in value) return { type, boolean: value.boolean };
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

/** A resolved value as a raw value to store (detaching an alias keeps what it gave); not styles. */
export function asTokenValue(value: ResolvedValue | null): TokenValue | null {
  if (!value) return null;
  if (value.type === "color") return { color: value.color };
  if (value.type === "number") return { number: value.number };
  if (value.type === "string") return { string: value.string };
  if (value.type === "boolean") return { boolean: value.boolean };
  return null;
}
