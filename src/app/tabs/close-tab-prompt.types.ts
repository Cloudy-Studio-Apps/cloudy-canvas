import type { SaveChangesChoice } from "@canvas-ui/file/close-dialog";

/** The question asked before a tab with changes nothing will save closes. */
export interface CloseTabQuestion {
  /** The file's name. */
  name: string;
  /** Saving before closing. */
  busy: boolean;
  choose(choice: SaveChangesChoice): void;
}

export interface CloseTabPromptState {
  /** The question on screen, `null` for none. */
  question: CloseTabQuestion | null;
}
