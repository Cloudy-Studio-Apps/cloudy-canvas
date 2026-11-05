import type { BrochureElement } from "../brochure";
import type { StartingSection } from "./brochure-pages.types";
import type { BrochureExpansion } from "./repeats/expand-brochure.types";
import type { PlacedPage } from "./page-starts.types";

/**
 * The sections starting on each page (indexed like `pages`), from the expansion's: a section, or
 * a copy of it with its own name, starts on the first page in it that prints, its pages running
 * to the next section at its depth or less; a section with no page that prints starts nowhere
 * (so the contents leave it out).
 */
export function pageStarts(
  record: Pick<BrochureElement, "sections">,
  expansion: BrochureExpansion,
  pages: readonly PlacedPage[],
): StartingSection[][] {
  const orderOf = new Map(expansion.pages.map((page, i) => [page.id, i]));
  const byId = new Map(record.sections.map((section) => [section.id, section]));
  const placed = expansion.sections.flatMap((item) => {
    const at = orderOf.get(item.start);
    return at === undefined ? [] : [{ item, at }];
  });
  const starts: StartingSection[][] = pages.map(() => []);
  placed.forEach(({ item, at }, k) => {
    const original = byId.get(item.from);
    if (!original) return;
    const next = placed.slice(k + 1).find((other) => other.item.level <= item.level);
    const end = next?.at ?? Infinity;
    const first = pages.findIndex((page) => page.printed && page.order >= at && page.order < end);
    const page = pages[first];
    if (!page) return;
    starts[first]?.push({
      section: { ...original, id: item.id, name: item.name, start: page.slot, level: item.level },
      depth: item.level,
    });
  });
  return starts;
}
