import { deepEqual } from "../utils";
import { readPath } from "./binding-path";
import { resolveStyle } from "./resolve-style";
import type { TokenStore } from "./token-store";
import type { StyleRecord, VariableType } from "./token.types";

/**
 * The style bindings still true after its value changed to `next`: a path whose value the change
 * wrote by hand is unlinked (the detach rule, as for layers).
 */
export function keptStyleBindings(
  style: StyleRecord,
  next: Readonly<Record<string, unknown>>,
): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const [path, variable] of Object.entries(style.bindings ?? {})) {
    // A color also drives its paint's or effect's opacity: either written by hand unlinks it.
    const leaves = path.endsWith(".color")
      ? [path, `${path.slice(0, -".color".length)}.opacity`]
      : [path];
    if (leaves.every((leaf) => deepEqual(readPath(style.value, leaf), readPath(next, leaf)))) {
      kept[path] = variable;
    }
  }
  return kept;
}

/**
 * The styles using any of these variables, unlinked from them: each keeps the values they gave
 * it in the file's modes.
 */
export function stylesWithout(store: TokenStore, variableIds: ReadonlySet<string>): StyleRecord[] {
  const changed: StyleRecord[] = [];
  for (const style of store.styles()) {
    const bindings = style.bindings ?? {};
    const gone = Object.entries(bindings).filter(([, id]) => variableIds.has(id));
    if (gone.length === 0) continue;
    const baked = resolveStyle(store, style, {});
    changed.push({
      ...style,
      value: baked,
      bindings: Object.fromEntries(
        Object.entries(bindings).filter(([, id]) => !variableIds.has(id)),
      ),
    });
  }
  return changed;
}

/**
 * The kind of variable that can drive the part of a style's value at `path` (a `….color` is a
 * color, otherwise by what's stored there), or `null` when the value has nothing there.
 */
export function styleLeafType(
  value: Readonly<Record<string, unknown>>,
  path: string,
): VariableType | null {
  const leaf = readPath(value, path);
  if (leaf === undefined || leaf === null) return null;
  if (path.endsWith(".color") && typeof leaf === "string") return "color";
  if (typeof leaf === "number") return "number";
  if (typeof leaf === "string") return "string";
  if (typeof leaf === "boolean") return "boolean";
  return null;
}

/**
 * A layer's bindings under `from` (`"fills"`) moved under `to` (`"paints"`), so a style made from
 * the layer keeps using the variables it did.
 */
export function movedBindings(
  bindings: Readonly<Record<string, string>> | undefined,
  from: string,
  to: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, id] of Object.entries(bindings ?? {})) {
    if (path.startsWith(`${from}.`)) out[`${to}${path.slice(from.length)}`] = id;
  }
  return out;
}

/** A layer's bindings at these paths (or under them), kept as they are. */
export function pickedBindings(
  bindings: Readonly<Record<string, string>> | undefined,
  paths: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(bindings ?? {}).filter(([path]) =>
      paths.some((p) => path === p || path.startsWith(`${p}.`)),
    ),
  );
}
