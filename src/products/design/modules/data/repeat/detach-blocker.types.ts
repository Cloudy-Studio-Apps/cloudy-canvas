/**
 * Why an iterator's copies can't be detached: the iterator is inside another iterator's copy
 * (`inside-copy`), or inside the card another iterator repeats (`repeated-card`), so the outer
 * iterator would write a detached copy over, or mirror it into every outer copy.
 */
export type DetachBlocker = "inside-copy" | "repeated-card";
