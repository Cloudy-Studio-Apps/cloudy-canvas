import type { BrochureRepeat } from "./brochure-repeat.types";
import type { RepeatTarget } from "./repeat-edits.types";

/** A brochure's repeating section or page, as the In scope view and the canvas name it. */
export interface LoopOwner {
  /** What repeats: the section, or the page. */
  target: RepeatTarget;
  /** The section's name, or the page's (its printed frame's). */
  name: string;
  repeat: BrochureRepeat;
}
