import type { FileAction } from "../use-file-actions.types";

export interface FileActionsMenuProps {
  actions: FileAction[];
  /** Accessible name of the ⋯ button, e.g. "More actions for Sprint retro". */
  label: string;
}
