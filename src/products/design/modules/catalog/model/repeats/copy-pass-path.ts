import { segmentOwner } from "./copy-segment";
import type { BrochureExpansion } from "./expand-brochure.types";

/**
 * The copy path of a section that is a copy of its own repeat (`sectionId` its expanded id: a
 * pass of the repeating section itself, its path ending in its own segment), else `null`: a plain
 * subsection inside a copy, or an inner repeat's template pass there, isn't a whole copy.
 */
export function copyPassPath(
  expansion: BrochureExpansion,
  sectionId: string,
): readonly string[] | null {
  const section = expansion.sections.find((item) => item.id === sectionId);
  const last = section?.path[section.path.length - 1];
  return section && last !== undefined && segmentOwner(last) === section.from ? section.path : null;
}
