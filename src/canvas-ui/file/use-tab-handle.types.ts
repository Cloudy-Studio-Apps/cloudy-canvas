import type { AutosaveControls } from "./use-canvas-autosave.types";

/** What a file's saver gives its tab's handle (`useTabHandle`). */
export interface TabHandleParts {
  /** Saves the file (asking where the first time); `false` when cancelled or failed. */
  save: () => Promise<boolean>;
  autosave: AutosaveControls;
  /** Takes the file's preview now. */
  capture: () => Promise<void>;
  /** The saves in line, the last one at the end. */
  queue: { readonly current: Promise<unknown> };
  /** Whether the file has changes nothing will save, read now (not from the last render). */
  needsSave: () => boolean;
}
