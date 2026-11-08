import { libraryIdOf } from "@canvas";
import type { TokenSource, TokenSourceGroup } from "./tokens.types";

/**
 * Where records come from, in the order lists show them: each library they come from (in
 * `order`, the project's libraries by id, then any other), then the file's own. `name` and
 * `editable` label and lock a library's group.
 */
export function tokenSources(
  records: readonly unknown[],
  order: readonly string[],
  name: (libraryId: string) => string,
  editable: (libraryId: string) => boolean,
): TokenSource[] {
  const libraries = new Set<string>();
  let local = false;
  for (const record of records) {
    const id = libraryIdOf(record);
    if (id === undefined) local = true;
    else libraries.add(id);
  }
  const rank = (id: string) => {
    const i = order.indexOf(id);
    return i < 0 ? order.length : i;
  };
  const sources: TokenSource[] = [...libraries]
    .sort((a, b) => rank(a) - rank(b))
    .map((id) => ({ libraryId: id, name: name(id), editable: editable(id) }));
  if (local) sources.push({ libraryId: null, name: "", editable: true });
  return sources;
}

/**
 * `items` split by `sources` (`tokenSources`), in their order; sources with none are left out.
 * `recordOf` gives an item's token record (the item itself by default).
 */
export function groupBySource<T>(
  items: readonly T[],
  sources: readonly TokenSource[],
  recordOf: (item: T) => unknown = (item) => item,
): TokenSourceGroup<T>[] {
  return sources
    .map((source) => ({
      source,
      items: items.filter((item) => (libraryIdOf(recordOf(item)) ?? null) === source.libraryId),
    }))
    .filter((group) => group.items.length > 0);
}
