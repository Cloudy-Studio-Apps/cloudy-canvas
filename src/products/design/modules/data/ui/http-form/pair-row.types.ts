/** One name and value being edited (a link setting, a header, a form value). */
export interface PairRow {
  /** Only keeps the row's place while editing (`createId()`). */
  id: string;
  name: string;
  value: string;
  /** Its value stays on this device (a private header). */
  secret?: boolean;
  /** This device already keeps its value: an empty `value` keeps it. */
  stored?: boolean;
}

/** A name or value offered while typing, with what it is for. */
export interface PairSuggestion {
  value: string;
  hint?: string;
}
