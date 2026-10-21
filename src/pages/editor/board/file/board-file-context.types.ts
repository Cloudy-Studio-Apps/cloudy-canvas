export type SaveStatus = "idle" | "saving" | "error";

/** The open board's file, for the editor chrome. */
export interface BoardFileContextValue {
  name: string;
  /** Where the board is saved; `null` until the first save. */
  path: string | null;
  /** Unsaved changes since the last save (or since opening). */
  dirty: boolean;
  status: SaveStatus;
  save: () => Promise<void>;
  saveAs: () => Promise<void>;
}
