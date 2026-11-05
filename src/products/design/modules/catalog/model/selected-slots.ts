import type { BrochurePage } from "./brochure-pages.types";

/**
 * The pages (slot ids, in the brochure's order) with one of `frames` among their options; pending
 * pages (which read as their template's frame) aren't selected with it.
 */
export function selectedSlots(pages: readonly BrochurePage[], frames: Iterable<string>): string[] {
  const ids = new Set(frames);
  return pages
    .filter((page) => !page.pending && page.options.some((option) => ids.has(option.id)))
    .map((page) => page.slot.id);
}
