/** What an edit asks the data sync to fill again. */
export interface AffectedData {
  /** A source's data, fields, name or images changed: every bound layer. */
  all: boolean;
  /** Otherwise, the changed layers that carry data fields. */
  nodes: string[];
  /**
   * Otherwise, the frames whose copies to bring in step (their `repeat` or something in them
   * changed). With `all`, every iterator.
   */
  iterators: string[];
}
