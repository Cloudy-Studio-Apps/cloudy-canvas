import type { BrochureRepeat } from "./brochure-repeat.types";
import type { BrochureExpansion } from "./expand-brochure.types";
import type { RepeatTarget } from "./repeat-edits.types";

/** A brochure's repeating section or page, as the In scope view and the canvas name it. */
export interface LoopOwner {
  /** What repeats: the section, or the page. */
  target: RepeatTarget;
  /**
   * The section's name as the page reads it (its copy's, or the template's at its preview row),
   * or the page's (its printed frame's).
   */
  name: string;
  repeat: BrochureRepeat;
}

/** Where a loop is seen from: the brochure's expansion and a page's place in it (-1: none). */
export interface LoopPlace {
  expansion: BrochureExpansion;
  page: number;
}
