import type { ArrangeHost, ArrangeItem } from "./arrange.types";

/**
 * The elements to align, distribute or tidy, each with its outline: the outlined, unlocked ones
 * among `ids` that don't already move with another of them (a frame's child goes with the frame).
 */
export function arrangeItems(ids: Iterable<string>, host: ArrangeHost): ArrangeItem[] {
  const all = new Set(ids);
  const carried = new Set<string>();
  for (const id of all) {
    for (const member of host.withMembers([id])) if (member !== id) carried.add(member);
  }
  const items: ArrangeItem[] = [];
  for (const id of all) {
    const el = carried.has(id) ? undefined : host.get(id);
    if (!el || el.locked) continue;
    const kind = host.kinds.kindOf(el);
    if (kind.boxed) items.push({ id, rect: kind.bounds(el) });
  }
  return items;
}
