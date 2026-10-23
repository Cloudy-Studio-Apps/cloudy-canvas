import { readingOrder, type CanvasElement, type ElementKinds } from "@canvas";

import { isSection } from "./is-section";

/** The sections N and Shift+N step through, in reading order. */
export function boardSections(
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): readonly CanvasElement[] {
  const sections = elements.flatMap((el) =>
    isSection(el) ? [{ el, rect: kinds.kindOf(el).bounds(el) }] : [],
  );
  return readingOrder(sections).map((section) => section.el);
}
