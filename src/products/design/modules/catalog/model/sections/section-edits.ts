import { createId } from "@shared/core";

import type { BrochureSection, BrochureSlot } from "../../brochure";
import { placeSections, sectionLevel, sectionWithChildren } from "./place-sections";

/** The section with its `level` written as `level` (left out at the top). */
function atLevel(section: BrochureSection, level: number): BrochureSection {
  const next = { ...section };
  delete next.level;
  return level > 0 ? { ...next, level } : next;
}

/**
 * The sections with a new one named `name` starting at slot `start` at `level` (none added when
 * one of that level starts there already).
 */
export function withSection(
  sections: readonly BrochureSection[],
  start: string,
  level: number,
  name: string,
): BrochureSection[] {
  if (sections.some((item) => item.start === start && sectionLevel(item) === level)) {
    return [...sections];
  }
  return [...sections, atLevel({ id: createId(), name, start }, level)];
}

/** The sections without `id` (its subsections then read as in the section before it). */
export function withoutSection(
  sections: readonly BrochureSection[],
  id: string,
): BrochureSection[] {
  return sections.filter((section) => section.id !== id);
}

/** The sections with `id` patched. */
export function patchSection(
  sections: readonly BrochureSection[],
  id: string,
  patch: Partial<BrochureSection>,
): BrochureSection[] {
  return sections.map((section) => (section.id === id ? { ...section, ...patch } : section));
}

/**
 * The sections with `id` and its subsections a level deeper (`delta` 1) or higher (-1), their
 * levels written as they read; `null` when it can't go (the top already, or deeper than one
 * under the section before).
 */
export function shiftedSection(
  sections: readonly BrochureSection[],
  slots: readonly BrochureSlot[],
  id: string,
  delta: 1 | -1,
): BrochureSection[] | null {
  const placed = placeSections(sections, slots);
  const at = placed.findIndex((item) => item.section.id === id);
  const head = placed[at];
  if (!head) return null;
  const before = placed[at - 1];
  if (delta === -1 && head.depth === 0) return null;
  if (delta === 1 && (!before || before.depth < head.depth)) return null;
  const moving = new Map(
    sectionWithChildren(placed, id).map((item) => [item.section.id, item.depth + delta]),
  );
  // Every other section keeps the level it reads at, so none jumps when this one moves.
  const reads = new Map(placed.map((item) => [item.section.id, item.depth]));
  return sections.map((section) =>
    atLevel(section, moving.get(section.id) ?? reads.get(section.id) ?? sectionLevel(section)),
  );
}
