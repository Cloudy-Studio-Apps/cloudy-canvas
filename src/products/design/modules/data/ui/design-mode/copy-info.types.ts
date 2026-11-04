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
  /** Inside another iterator's copy: only detaching the outer copy lasts. */
  nested: boolean;
}
