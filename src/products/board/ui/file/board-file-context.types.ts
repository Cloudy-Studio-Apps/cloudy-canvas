export type SaveStatus = "idle" | "saving" | "error";

/** What wrote the board: the user (Save) or autosave. */
export type SaveKind = "manual" | "auto";

/** The open board's file, for the editor chrome. */
export interface BoardFileContextValue {
  name: string;
  /** Where the board is saved; `null` until a location is chosen (it may be a draft meanwhile). */
  path: string | null;
  /** Autosaved in the app data folder; Save asks where to put it. */
  draft: boolean;
  /** Unsaved changes since the last save (or since opening). */
  dirty: boolean;
  status: SaveStatus;
  /** How the board was just saved, for a few seconds after each save; `null` otherwise. */
  saved: SaveKind | null;
  /** Whether autosave is on. */
  autosave: boolean;
  save: () => Promise<void>;
  saveAs: () => Promise<void>;
}
