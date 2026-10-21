import type { ReactNode } from "react";

import type { FileAction } from "../use-file-actions.types";

export interface FileContextMenuProps {
  actions: FileAction[];
  /** The element right-clicked to open the menu. */
  children: ReactNode;
}
