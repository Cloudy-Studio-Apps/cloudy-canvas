import type { BrochureSection } from "../../brochure";

/** A section in reading order, with how deep it reads and the section it's in. */
export interface PlacedSection {
  section: BrochureSection;
  /** Its level as read: never more than one under the section before. */
  depth: number;
  /** The section it's in, `null` at the top. */
  parent: string | null;
  /** Its first page's place among the slots. */
  position: number;
}

/** How far up a `{section}` token reads: `0` its own section only, `"all"` every parent. */
export type SectionParents = number | "all";

/** The levels a section can start at on a page, `null` where it can't. */
export interface StartLevels {
  /** Next to the section the page is in (or at the top when it's in none). */
  section: number | null;
  /** Inside the section the page is in, or the deepest starting on it. */
  subsection: number | null;
}
