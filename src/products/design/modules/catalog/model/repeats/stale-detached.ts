import type { BrochureElement, BrochureSlot } from "../../brochure";
import { segmentOwner } from "./copy-segment";
import { detachedRows } from "./detached-rows";
import type { BrochureRepeat } from "./brochure-repeat.types";

/** The copy segments of an expanded id (`expandedId`): none for a template's. */
const segmentsOf = (id: string) => {
  const at = id.indexOf("@");
  return at === -1 ? [] : id.slice(at + 1).split("/");
};

/**
 * A brochure's slots and sections without what a loop that's gone left (its repeat removed, its
 * section or page deleted): `detached` and `detachedPages` keys whose path runs through it (never
 * made again anyway), and the `detached` mark of a page taken out of loops none of which repeats
 * any more (it's a plain template page again). A page still inside a loop that repeats stays out
 * of the runs. The same objects when nothing changes. Pure.
 */
export function withoutStaleDetached<R extends Pick<BrochureElement, "slots" | "sections">>(
  record: R,
): R {
  const loops = new Set<string>();
  for (const item of [...record.sections, ...record.slots]) if (item.repeat) loops.add(item.id);
  const live = (segments: readonly string[]) =>
    segments.every((segment) => loops.has(segmentOwner(segment)));
  let changed = false;

  const clean = <T extends { repeat?: BrochureRepeat }>(item: T): T => {
    const { repeat } = item;
    if (!repeat) return item;
    const detached = repeat.detached.filter((key) => live(key.split("/")));
    const pages = repeat.detachedPages?.filter((id) => live(segmentsOf(id)));
    const samePages = (pages?.length ?? 0) === (repeat.detachedPages?.length ?? 0);
    if (detached.length === repeat.detached.length && samePages) return item;
    changed = true;
    const next: BrochureRepeat = { ...repeat, detached };
    if (pages && pages.length > 0) next.detachedPages = pages;
    else delete next.detachedPages;
    return { ...item, repeat: next };
  };
  const slots = record.slots.map((slot): BrochureSlot => {
    const cleaned = clean(slot);
    const { detached } = cleaned;
    if (!detached || detachedRows(detached).some((segment) => loops.has(segmentOwner(segment)))) {
      return cleaned;
    }
    changed = true;
    const plain = { ...cleaned };
    delete plain.detached;
    return plain;
  });
  const sections = record.sections.map(clean);
  return changed ? { ...record, slots, sections } : record;
}
