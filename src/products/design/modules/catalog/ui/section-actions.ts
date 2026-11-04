import type { BrochureSection } from "../brochure";
import type { DesignBrochure } from "../model/design-brochure";
import { patchSection, shiftedSection, withoutSection, withSection } from "../model/sections";
import { t } from "../catalog.i18n";

/** Starts a section ("Section 4") at page `slotId` at `level`, in one undo step. */
export function startSection(brochure: DesignBrochure, slotId: string, level: number): void {
  const sections = brochure.masters.sections();
  brochure.masters.setSections(withSection(sections, slotId, level, nextSectionName(sections)));
}

/** Removes section `id` (its pages stay), in one undo step. */
export function removeSection(brochure: DesignBrochure, id: string): void {
  brochure.masters.setSections(withoutSection(brochure.masters.sections(), id));
}

/** Moves section `id` and its subsections a level deeper (1) or up (-1), when it can go. */
export function shiftSection(brochure: DesignBrochure, id: string, delta: 1 | -1): void {
  const next = canShift(brochure, id, delta);
  if (next) brochure.masters.setSections(next);
}

/** The sections after `shiftSection`, `null` when it can't go that way. */
export function canShift(
  brochure: DesignBrochure,
  id: string,
  delta: 1 | -1,
): BrochureSection[] | null {
  return shiftedSection(brochure.masters.sections(), brochure.record()?.slots ?? [], id, delta);
}

/** What a new section is called before it's renamed. */
export function nextSectionName(sections: readonly BrochureSection[]): string {
  return t("section.defaultName", { n: sections.length + 1 });
}

/** Renames section `id`, in one undo step. */
export function renameSection(brochure: DesignBrochure, id: string, name: string): void {
  brochure.masters.setSections(patchSection(brochure.masters.sections(), id, { name }));
}
