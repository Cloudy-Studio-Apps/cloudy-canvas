import type { BrochureSection, BrochureSlot } from "../../brochure";

/** Copies taken out of their repeats (`detachPages`, `detachPasses`): the record's new fields. */
export interface DetachEdit {
  slots: BrochureSlot[];
  sections: BrochureSection[];
  /** The frames of every copy taken out (kept as pages or not): free them (`freedCopyPatches`). */
  free: string[];
}

/** A whole copy taken out (`detachPasses`): its loop, its `copyPathKey` and its path. */
export interface DetachCut {
  owner: string;
  key: string;
  path: readonly string[];
}
