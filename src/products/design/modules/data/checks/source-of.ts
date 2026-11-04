import { parsePath } from "../table";
import type { DataScope } from "../bindings";

/**
 * The id of the source an expression reads, by its first name up the chain of scopes (a source's
 * name, or a row name that carries its list's source); `undefined` for a name that is neither.
 */
export function sourceOf(scope: DataScope, expr: string): string | undefined {
  let first: string | undefined;
  try {
    const step = parsePath(expr)[0];
    first = step && "key" in step ? step.key : undefined;
  } catch {
    return undefined;
  }
  if (first === undefined) return undefined;
  for (let s: DataScope | null = scope; s; s = s.parent) {
    const id = s.sources.get(first);
    if (id) return id;
    if (Object.hasOwn(s.names, first)) return undefined;
  }
  return undefined;
}
