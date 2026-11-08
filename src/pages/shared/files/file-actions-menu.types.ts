import type { FileAction } from "./file-action.types";

export interface FileActionsMenuProps {
  actions: FileAction[];
  /** Accessible name of the ⋯ button, e.g. "More actions for Sprint retro". */
  label: string;
}
