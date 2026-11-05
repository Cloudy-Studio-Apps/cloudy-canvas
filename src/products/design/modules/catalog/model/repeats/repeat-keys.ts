import type { BrochureRepeat } from "./brochure-repeat.types";

type WithRepeat = { id: string; repeat?: BrochureRepeat };

/**
 * `item` with keys added to its repeat's `field` (`detached`, whole copies, or `detachedPages`,
 * single pages) when `keys` has some for its id; the same object when nothing changes.
 */
export function withRepeatKeys<T extends WithRepeat>(
  item: T,
  keys: ReadonlyMap<string, readonly string[]>,
  field: "detached" | "detachedPages",
): T {
  const { repeat } = item;
  const there = repeat?.[field] ?? [];
  const added = (keys.get(item.id) ?? []).filter((key) => !there.includes(key));
  if (!repeat || added.length === 0) return item;
  return { ...item, repeat: { ...repeat, [field]: [...there, ...added] } };
}

/** Adds `key` to `owner`'s list in `keys`. */
export function addKey(keys: Map<string, string[]>, owner: string, key: string): void {
  const list = keys.get(owner) ?? [];
  if (!list.includes(key)) list.push(key);
  keys.set(owner, list);
}
