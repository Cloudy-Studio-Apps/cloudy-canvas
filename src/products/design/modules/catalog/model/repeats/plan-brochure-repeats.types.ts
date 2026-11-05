import type { BrochureSlot } from "../../brochure";
import type { PageCopyPlan } from "./plan-page-copy.types";

/** What keeps a brochure's generated pages in step with its expansion. Pure data. */
export interface BrochureRepeatsPlan {
  /** One per copy made, in the expansion's order (those with nothing to write included). */
  pages: PageCopyPlan[];
  /** The record's slots, in the expansion's order, when they differ from the record's. */
  slots: BrochureSlot[] | null;
  /** The layers of copies no longer made (their frames and all they hold). */
  remove: string[];
}
