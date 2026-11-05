import type { DataScope } from "../../../data";
import type { BrochureRepeat, RepeatTarget } from "../../model/repeats";

/** A brochure section's or page's repeat, as its panel reads and sets it. */
export interface BrochureRepeatState {
  target: RepeatTarget;
  /** Its repeat, `null` while it doesn't repeat (or it's gone). */
  repeat: BrochureRepeat | null;
  /** The scope around it (the sources and the loops it's in): where its list is read. */
  scope: DataScope;
  /** Sets the fields given (merged over its repeat) or, with `null`, removes it: one undo step. */
  apply: (patch: Partial<BrochureRepeat> | null) => void;
}
