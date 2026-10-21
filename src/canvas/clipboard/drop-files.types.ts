/** What a drop added. */
export interface DropResult {
  /** Ids of the elements added. */
  added: string[];
  /** Names of the files that couldn't be added (not an image or text, unreadable, empty). */
  skipped: string[];
}
