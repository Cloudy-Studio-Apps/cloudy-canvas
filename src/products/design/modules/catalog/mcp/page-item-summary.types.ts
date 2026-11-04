/** A page item as get_brochure_page lists it. */
export interface PageItemSummary {
  node: string;
  name: string;
  /** What it shows on this page. */
  text: string;
  /** Its words with their tokens ("Page {page} of {pages}"). */
  template: string;
  /** A page reference's section or page ("" while none is picked). */
  target?: string;
  /** On a master's locked copy: the master layer it copies, to change instead. */
  fromMaster?: string;
}
