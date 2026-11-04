import type { BrochureSection } from "../../brochure";

/** A printed side of the brochure as its headers and footers read it. */
export interface PageInfo {
  /** Whether it counts toward the numbers (uncounted covers don't). */
  counted: boolean;
  /** Its number, `null` when it isn't counted. */
  number: number | null;
  /** Its number as written ("4", "iv"), empty when it's hidden (a cover, a blank) or uncounted. */
  label: string;
  /** The section it's in, `null` before the first. */
  section: BrochureSection | null;
  /** The side of the spine it's on (always `right` in the single layout). */
  parity: "left" | "right";
  /** Whether it's the front or the back cover. */
  cover: boolean;
}
