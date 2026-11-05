import { parsePath } from "../table";
import { readsUnreadable, type DataScope } from "../bindings";

/** An expression's first name, `undefined` when it doesn't start with one. */
function firstName(expr: string): string | undefined {
  try {
    const step = parsePath(expr)[0];
    return step && "key" in step ? step.key : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The id of the source an expression reads, by its first name up the chain of scopes (a source's
 * name, or a row name that carries its list's source); `undefined` for a name that is neither.
 */
export function sourceOf(scope: DataScope, expr: string): string | undefined {
  const first = firstName(expr);
  if (first === undefined) return undefined;
  for (let s: DataScope | null = scope; s; s = s.parent) {
    const id = s.sources.get(first);
    if (id) return id;
    if (Object.hasOwn(s.names, first)) return undefined;
  }
  return undefined;
}

/**
 * Like `sourceOf`, and also a source whose data can't be read here (`readsUnreadable`), found by
 * its name in `byName` (name → id): what an export reads, readable or not.
 */
export function sourceReadBy(
  scope: DataScope,
  expr: string,
  byName: ReadonlyMap<string, string>,
): string | undefined {
  const id = sourceOf(scope, expr);
  if (id !== undefined || !readsUnreadable(scope, expr)) return id;
  const first = firstName(expr);
  return first === undefined ? undefined : byName.get(first);
}
