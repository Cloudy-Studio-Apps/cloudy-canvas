import type { BrochureSection } from "../../brochure";
import type { SectionParents } from "./sections.types";

/** Between a section's name and its parents' in `{section:…}`. */
export const SECTION_JOIN = " › ";

/**
 * What `{section}` writes for a page in sections `path` (outermost first): its own section's
 * name, with `parents` of the sections it's in before it (`"all"`: every one).
 */
export function sectionLabel(path: readonly BrochureSection[], parents: SectionParents): string {
  if (path.length === 0) return "";
  const shown = parents === "all" ? path : path.slice(Math.max(0, path.length - 1 - parents));
  return shown.map((section) => section.name).join(SECTION_JOIN);
}
