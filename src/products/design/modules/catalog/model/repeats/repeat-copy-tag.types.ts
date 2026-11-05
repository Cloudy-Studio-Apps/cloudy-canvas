/**
 * What marks a layer of a page a brochure's repeat made (`repeatCopy`): the brochure, the loop
 * that made the copy and its copy path, and the template layer it copies. The data module's
 * `dataCopy` tag isn't used: its sync leaves `dataCopy` layers to their (card) iterator and frees
 * those whose iterator isn't a frame, while a generated page's layers are filled like any other,
 * in the scope of the loops around the page.
 */
export interface RepeatCopyTag {
  /** The brochure's id. */
  brochure: string;
  /** The loop that made the copy: the innermost repeating section's or slot's id in its path. */
  iterator: string;
  /** Its copy path (`copyPathKey(path)`). */
  key: string;
  /** The template layer's id (the template page frame's for the page's own frame). */
  source: string;
}
