import type { BrochureSettings, BrochureSlot } from "../brochure";

/**
 * The slot printed as the back cover, read from the record alone (no frames): the last of
 * `slots` in a book with a back cover (`covers` `both` or `back`) and more than one page, as
 * `bookLayout` places it and `isBackCover` finds its spread; `null` otherwise. A spread frame
 * there isn't a back cover in the layout, which only frames tell: this can't see it.
 */
export function backCoverSlot(
  slots: readonly BrochureSlot[],
  settings: Pick<BrochureSettings, "layout" | "covers">,
): BrochureSlot | null {
  if (settings.layout !== "book") return null;
  if (settings.covers !== "both" && settings.covers !== "back") return null;
  return slots.length > 1 ? (slots.at(-1) ?? null) : null;
}
