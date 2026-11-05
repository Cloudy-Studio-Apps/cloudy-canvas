import type { BrochureElement } from "../brochure";
import type { StartingSection } from "./brochure-pages.types";
import type { BrochureExpansion } from "./repeats/expand-brochure.types";
import type { PlacedPage } from "./page-starts.types";

/**
 * The sections starting on each page (indexed like `pages`), from the expansion's: a section, or
 * a copy of it with its own name, starts on the first page that prints within its range in the
 * expansion (`ExpandedSection.first`/`end`, the loops' own tree, so a repeating section's run
 * never reaches the back cover); a section with no page that prints starts nowhere (so the
 * contents leave it out).
 */
export function pageStarts(
  record: Pick<BrochureElement, "sections">,
  expansion: BrochureExpansion,
  pages: readonly PlacedPage[],
): StartingSection[][] {
  const byId = new Map(record.sections.map((section) => [section.id, section]));
  const starts: StartingSection[][] = pages.map(() => []);
  for (const item of expansion.sections) {
    const original = byId.get(item.from);
    if (!original) continue;
    const first = pages.findIndex(
      (page) => page.printed && page.order >= item.first && page.order < item.end,
    );
    const page = pages[first];
    if (!page) continue;
    starts[first]?.push({
      section: { ...original, id: item.id, name: item.name, start: page.slot, level: item.level },
      depth: item.level,
    });
  }
  return starts;
}
