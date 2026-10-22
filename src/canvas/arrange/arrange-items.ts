import type { CanvasElement } from "../elements";
import { elementBounds } from "../elements/element-bounds";
import type { ArrangeHost, ArrangeItem } from "./arrange.types";

/**
 * The unlocked elements among `ids` that don't already move with another of them (a frame's child
 * goes with the frame): what arranging and turning act on, each once.
 */
export function arrangeRoots(ids: Iterable<string>, host: ArrangeHost): CanvasElement[] {
  const all = new Set(ids);
  const carried = new Set<string>();
  for (const id of all) {
    for (const member of host.withMembers([id])) if (member !== id) carried.add(member);
  }
  const roots: CanvasElement[] = [];
  for (const id of all) {
    const el = carried.has(id) ? undefined : host.get(id);
    if (el && !el.locked) roots.push(el);
  }
  return roots;
}

/** The elements to align, distribute or tidy: the outlined roots, each with where it shows. */
export function arrangeItems(ids: Iterable<string>, host: ArrangeHost): ArrangeItem[] {
  return arrangeRoots(ids, host)
    .filter((el) => host.kinds.kindOf(el).boxed)
    .map((el) => ({ id: el.id, rect: elementBounds(host.kinds.kindOf(el), el) }));
}
