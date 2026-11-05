import type { BrochureSlot } from "../brochure";
import type { BrochurePage } from "./brochure-pages.types";

/**
 * Where a place among the pages shown (`at`, 0-based among `pages` without `moving`, as the page
 * list and agents count them: pending and not printed pages included) falls among the stored
 * slots (among `slots` without `moving`, what `moveMany` and `addPages` take), so a page put after
 * a run of pending pages lands after it. Copies (made or pending) are passed over: their stored
 * place isn't theirs to keep, as the sync puts them back after their template. The place is
 * before the first other stored page at or after `at` (`next`, else last), or before the last at
 * or before `at` (`previous`, moving up past a run, else first).
 */
export function storedPosition(
  slots: readonly BrochureSlot[],
  pages: readonly BrochurePage[],
  moving: Iterable<string>,
  at: number,
  toward: "next" | "previous" = "next",
): number {
  const skip = new Set(moving);
  const stored = new Map(
    slots.filter((slot) => !skip.has(slot.id)).map((slot, i) => [slot.id, i] as const),
  );
  const shown = pages.filter((page) => !skip.has(page.slot.id));
  const indexOf = (page: BrochurePage | undefined) =>
    page && !page.pending && !page.slot.generated ? stored.get(page.slot.id) : undefined;
  if (toward === "previous") {
    for (let i = Math.min(at, shown.length - 1); i >= 0; i--) {
      const index = indexOf(shown[i]);
      if (index !== undefined) return index;
    }
    return 0;
  }
  for (let i = Math.max(at, 0); i < shown.length; i++) {
    const index = indexOf(shown[i]);
    if (index !== undefined) return index;
  }
  return stored.size;
}
