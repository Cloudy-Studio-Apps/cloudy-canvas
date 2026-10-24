import type { BrochureSlot } from "../brochure";
import type { FrameElement } from "../../frame";

/** A brochure page as it is now: its slot with the frames that still exist. */
export interface BrochurePage {
  slot: BrochureSlot;
  /** 1-based, in the brochure's order. */
  number: number;
  /** The frame printed (the slot's choice, or its first option when that one is gone). */
  frame: FrameElement;
  /** Every option that still exists, in the slot's order. */
  options: FrameElement[];
}
