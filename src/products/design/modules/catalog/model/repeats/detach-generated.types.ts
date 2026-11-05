import type { BrochureSection, BrochureSlot } from "../../brochure";

/** Copies taken out of their repeats (`detachGenerated`): the record's new fields and what to free. */
export interface DetachEdit {
  slots: BrochureSlot[];
  sections: BrochureSection[];
  /** The frames of every copy taken out (kept as pages or not): untag and unlock them. */
  free: string[];
}
