import type { ReactNode } from "react";

import type { FolderRow } from "./page-tree.types";

export interface CopyFolderMenuProps {
  /** A copy section's folder (`FolderRow.copy`). */
  folder: FolderRow;
  /** The row the menu opens on. */
  children: ReactNode;
}
