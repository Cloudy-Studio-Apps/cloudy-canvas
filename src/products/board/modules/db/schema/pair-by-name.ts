/**
 * Pairs incoming items with existing ones: first by exact name, then an unpaired incoming item
 * takes the unpaired existing item at the same position. That way a rename keeps the item's id
 * (and the relations pointing at it). Returns `incoming index → existing item`; unpaired incoming
 * items are new and unpaired existing items were removed.
 */
export function pairByName<T extends { name: string }>(
  incoming: readonly { name: string }[],
  existing: readonly T[],
): Map<number, T> {
  const pairs = new Map<number, T>();
  const byName = new Map(existing.map((item) => [item.name, item]));
  const used = new Set<T>();
  incoming.forEach((item, i) => {
    const match = byName.get(item.name);
    if (match && !used.has(match)) {
      pairs.set(i, match);
      used.add(match);
    }
  });
  incoming.forEach((_, i) => {
    const candidate = existing[i];
    if (pairs.has(i) || !candidate || used.has(candidate)) return;
    pairs.set(i, candidate);
    used.add(candidate);
  });
  return pairs;
}
