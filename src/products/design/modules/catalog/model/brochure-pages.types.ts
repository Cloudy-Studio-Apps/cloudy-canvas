import type { BrochureSection, BrochureSlot } from "../brochure";
import type { FrameElement } from "../../frame";
import type { ExpandedPage } from "./repeats/expand-brochure.types";

/** A section starting on a page, as its repeats expand it (a copy has its own id and name). */
export interface StartingSection {
  /**
   * The section, or a copy of it: its id the expanded one (`expandedId`), its `name` with its
   * tokens read, its `start` this page's slot.
   */
  section: BrochureSection;
  /** How deep it reads (`placeSections`). */
  depth: number;
}

/** A brochure page as it is now: its slot with the frames that still exist. */
export interface BrochurePage {
  /**
   * Its slot; for a pending page, one made up for it (its id the expanded page's, `generated`
   * saying what it copies), never in the record.
   */
  slot: BrochureSlot;
  /** 1-based, in the brochure's order. */
  number: number;
  /**
   * The frame printed (the slot's choice, or its first option when that one is gone); for a
   * pending page, its template page's.
   */
  frame: FrameElement;
  /** Every option that still exists, in the slot's order. */
  options: FrameElement[];
  /**
   * A page a repeat will make but hasn't (past its `designLimit`, or not made yet): it counts
   * in the layout and its numbers, but has no frame of its own and can't print yet.
   */
  pending?: ExpandedPage;
  /** A template page whose repeat's list is empty for its row: it stays, but prints nothing. */
  notPrinted?: true;
  /** The sections starting on it, outermost first (copy sections included). */
  starts: readonly StartingSection[];
}
