import type { ScopeLayer } from "../../../data";

/** A page of the brochure as its repeats expand it: a template page, a made copy or a pending one. */
export interface ExpandedPage {
  /** `from` for a template page, `${from}@${path.join("/")}` for a copy (`expandedId`). */
  id: string;
  /** The template slot's id. */
  from: string;
  /** The copy keys of the loops around it, outermost first; `[]` for a template page. */
  path: string[];
  /** The rows of the loops around it, outermost first. */
  layers: ScopeLayer[];
  /** `false`: a pending page, counted but not made until the export. */
  made: boolean;
  /** `false` when a page repeat's list is empty in its scope (or a section repeat's): no page prints. */
  printed: boolean;
}

/** A section as its repeats expand it: the section itself or a copy of it with its own name. */
export interface ExpandedSection {
  /** `from` for the section itself, `${from}@${path.join("/")}` for a copy. */
  id: string;
  /** The section's id. */
  from: string;
  path: string[];
  /** Its name with its tokens read in its scope (`copyName`). */
  name: string;
  /** Its depth as `placeSections` reads it. */
  level: number;
  /** The `ExpandedPage` id it starts at. */
  start: string;
}

/** Every page and section of a brochure, its repeats expanded, in reading order. */
export interface BrochureExpansion {
  pages: ExpandedPage[];
  /** Sections in reading order (by first page, then level). */
  sections: ExpandedSection[];
  /** How many pages aren't made (`made: false`). */
  pending: number;
}
