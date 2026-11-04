/** A list of objects found in parsed data, which could be its rows: where it is, how long. */
export interface DataList {
  /** Its path (`products`, `data.items`); `""` when the data itself is the list. */
  path: string;
  count: number;
}

/** A plain value at the top of the data, beside its rows (`total`, `next`, …). */
export type DataExtraValue = string | number | boolean | null;
