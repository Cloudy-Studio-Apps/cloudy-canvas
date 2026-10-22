import { rectContainsRect, type CanvasElement, type ElementKinds } from "@canvas";

import { isSection } from "./is-section";
import type { SectionElement } from "./section.types";

/** Elements that belong to a section: everything fully inside it, nested sections included. */
export function sectionMembers(
  section: SectionElement,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): CanvasElement[] {
  const area = kinds.kindOf(section).bounds(section);
  return elements.filter(
    (el) => el.id !== section.id && rectContainsRect(area, kinds.kindOf(el).bounds(el)),
  );
}

/** The ids plus everything inside any of them that's a section (it moves and deletes with it). */
export function withSectionMembers(
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): Set<string> {
  const result = new Set(ids);
  for (const el of elements) {
    if (!result.has(el.id) || !isSection(el)) continue;
    for (const member of sectionMembers(el, elements, kinds)) result.add(member.id);
  }
  return result;
}

/** Every section, top to bottom then left to right. */
export function boardSections(elements: readonly CanvasElement[]): SectionElement[] {
  return elements.filter(isSection).sort((a, b) => a.y - b.y || a.x - b.x);
}
