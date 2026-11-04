import type { BrochurePage } from "./brochure-pages.types";

/** The pages (slot ids, in the brochure's order) with one of `frames` among their options. */
export function selectedSlots(pages: readonly BrochurePage[], frames: Iterable<string>): string[] {
  const ids = new Set(frames);
  return pages
    .filter((page) => page.options.some((option) => ids.has(option.id)))
    .map((page) => page.slot.id);
}
