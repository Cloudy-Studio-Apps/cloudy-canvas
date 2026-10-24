/** A path's parts, numbers for array indexes: `"fills.0.color"` → `["fills", 0, "color"]`. */
function partsOf(path: string): (string | number)[] {
  return path.split(".").map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

/** The field a path starts at: `"fills.0.color"` → `"fills"`. */
export function pathRoot(path: string): string {
  const dot = path.indexOf(".");
  return dot < 0 ? path : path.slice(0, dot);
}

/** The value at a path of an element (`undefined` when any step is missing). */
export function readPath(el: object, path: string): unknown {
  let current: unknown = el;
  for (const part of partsOf(path)) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string | number, unknown>)[part];
  }
  return current;
}

/** The parent object at a path (where its last part lives), or `undefined`. */
export function readParent(el: object, path: string): Record<string, unknown> | undefined {
  const dot = path.lastIndexOf(".");
  if (dot < 0) return el as Record<string, unknown>;
  const parent = readPath(el, path.slice(0, dot));
  return typeof parent === "object" && parent !== null
    ? (parent as Record<string, unknown>)
    : undefined;
}

/**
 * The patch that sets `values` (paths → values, all under the same root field) on an element: its
 * root field copied with the changes, or `null` when a path's parent is missing.
 */
export function setPathsPatch(
  el: object,
  values: Readonly<Record<string, unknown>>,
): Record<string, unknown> | null {
  const patch: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(values)) {
    const [root, ...rest] = partsOf(path);
    if (typeof root !== "string") return null;
    if (rest.length === 0) {
      patch[root] = value;
      continue;
    }
    const start = root in patch ? patch[root] : (el as Record<string, unknown>)[root];
    const updated = setIn(start, rest, value);
    if (updated === undefined) return null;
    patch[root] = updated;
  }
  return patch;
}

/** A copy of `target` with the value at `parts` replaced (`undefined` when a step is missing). */
function setIn(target: unknown, parts: (string | number)[], value: unknown): unknown {
  const [part, ...rest] = parts;
  if (part === undefined) return value;
  if (typeof target !== "object" || target === null) return undefined;
  const container = target as Record<string | number, unknown>;
  if (!(part in container)) return undefined;
  const child = rest.length === 0 ? value : setIn(container[part], rest, value);
  if (child === undefined) return undefined;
  if (Array.isArray(target)) {
    const copy = [...(target as unknown[])];
    copy[part as number] = child;
    return copy;
  }
  return { ...container, [part]: child };
}

/**
 * Bindings after a stack field (`fills`, `effects`, `fills.0.stops`) changed its entries: each path
 * under `field.<i>` moves to `field.<map(i)>`, or is dropped when `map` returns `null`.
 */
export function remapStackBindings(
  bindings: Readonly<Record<string, string>>,
  field: string,
  map: (index: number) => number | null,
): Record<string, string> {
  const next: Record<string, string> = {};
  const prefix = `${field}.`;
  for (const [path, id] of Object.entries(bindings)) {
    if (!path.startsWith(prefix)) {
      next[path] = id;
      continue;
    }
    const rest = path.slice(prefix.length);
    const dot = rest.indexOf(".");
    const indexText = dot < 0 ? rest : rest.slice(0, dot);
    if (!/^\d+$/.test(indexText)) {
      next[path] = id;
      continue;
    }
    const moved = map(Number(indexText));
    if (moved === null) continue;
    next[`${prefix}${moved}${dot < 0 ? "" : rest.slice(dot)}`] = id;
  }
  return next;
}

/** Bindings without the paths at or under `field` (its value was replaced wholesale). */
export function withoutBindingsUnder(
  bindings: Readonly<Record<string, string>>,
  field: string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(bindings).filter(([path]) => path !== field && !path.startsWith(`${field}.`)),
  );
}
