import type { DetachBlocker } from "../../repeat";

/** Where an iterator's copy comes from, for the properties panel. */
export interface CopyInfo {
  /** The list its iterator repeats (`products`); "" when it no longer repeats. */
  source: string;
  /** Its row's number (1-based) among the rows shown, `null` when it isn't shown. */
  row: number | null;
  /** The iterator frame holding the copy. */
  iterator: string;
  /** The template layer it's a copy of. */
  template: string;
  /** Why it can't be detached (`detachBlocker`), `null` when it can. */
  blocked: DetachBlocker | null;
}
