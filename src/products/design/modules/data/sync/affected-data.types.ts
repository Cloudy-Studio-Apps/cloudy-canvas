/** What an edit asks the data sync to fill again. */
export interface AffectedData {
  /** A source's data, fields, name or images changed: every bound layer. */
  all: boolean;
  /** Otherwise, the changed layers that carry data fields. */
  nodes: string[];
}
