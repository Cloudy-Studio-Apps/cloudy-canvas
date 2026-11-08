/** What a drop added. */
export interface DropResult {
  /** Ids of the elements added (models from `importFiles` hooks included). */
  added: string[];
  /** Names of the files that couldn't be added (not an image, text or other file the product takes, unreadable, empty; files an `importFiles` hook claimed are never here). */
  skipped: string[];
}
