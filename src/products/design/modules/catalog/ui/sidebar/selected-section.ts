import type { BrochurePage } from "../../model/brochure-pages.types";

/**
 * The section (one the user made, not a copy a repeat made) whose made pages, its subsections'
 * included, are exactly `slots`: what a click on its folder in the page list selects. `null` for
 * none. Pending pages and pages that don't print are never selected, so they don't count.
 */
export function selectedSection(
  pages: readonly BrochurePage[],
  slots: readonly string[],
): string | null {
  const open: (string | null)[] = [];
  const bySection = new Map<string, string[]>();
  for (const page of pages) {
    if (page.notPrinted) continue;
    for (const { section, from, depth } of page.starts) {
      open.length = Math.min(open.length, depth);
      open.push(section.id === from ? section.id : null);
    }
    if (page.pending) continue;
    for (const id of open) {
      if (id !== null) bySection.set(id, [...(bySection.get(id) ?? []), page.slot.id]);
    }
  }
  const wanted = new Set(slots);
  for (const [id, own] of bySection) {
    if (own.length === wanted.size && own.every((slot) => wanted.has(slot))) return id;
  }
  return null;
}
