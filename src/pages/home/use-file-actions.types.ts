import type { LucideIcon } from "lucide-react";

import type { FileInfo } from "@shared/core";

export interface FileAction {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
  /** Drawn in the destructive color, after a separator. */
  destructive?: boolean;
}

export interface FileActionsOptions {
  file: FileInfo;
  /** The file isn't where it was last seen: offer to locate it instead of opening it. */
  missing: boolean;
  onOpen: (file: FileInfo) => void;
}
