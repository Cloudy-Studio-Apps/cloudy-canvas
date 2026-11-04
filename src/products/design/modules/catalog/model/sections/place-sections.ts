import type { BrochureSection, BrochureSlot } from "../../brochure";
import type { PlacedSection } from "./sections.types";

/** A section's level as written (0 when left out). */
export function sectionLevel(section: BrochureSection): number {
  return Math.max(0, Math.round(section.level ?? 0));
}

/**
 * The sections of the slots in reading order (by first page, then level), each with its depth and
 * parent: a section is in the last one before it that's less deep, and reads no deeper than one
 * under the section before. Sections on slots that are gone are left out.
 */
export function placeSections(
  sections: readonly BrochureSection[],
  slots: readonly BrochureSlot[],
): PlacedSection[] {
  const position = new Map(slots.map((slot, i) => [slot.id, i]));
  const ordered = sections
    .filter((section) => position.has(section.start))
    .map((section) => ({ section, position: position.get(section.start) ?? 0 }))
    .sort((a, b) => a.position - b.position || sectionLevel(a.section) - sectionLevel(b.section));
  const stack: string[] = [];
  return ordered.map(({ section, position }) => {
    const depth = Math.min(sectionLevel(section), stack.length);
    stack.length = depth;
    const parent = stack.at(-1) ?? null;
    stack.push(section.id);
    return { section, depth, parent, position };
  });
}

/** The section `id` and every section inside it, deepest last (in reading order). */
export function sectionWithChildren(placed: readonly PlacedSection[], id: string): PlacedSection[] {
  const at = placed.findIndex((item) => item.section.id === id);
  const head = placed[at];
  if (!head) return [];
  const end = placed.findIndex((item, i) => i > at && item.depth <= head.depth);
  return placed.slice(at, end === -1 ? undefined : end);
}
