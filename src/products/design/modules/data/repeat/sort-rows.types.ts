/** A row's value for one sort rule, read once before sorting. */
export interface SortValue {
  /** `null` for a missing value (sorted last). */
  text: string | null;
  number: number | null;
}
