import type { ReactNode } from "react";

import type { FileInfo } from "@shared/core";
import type { FileAction } from "../use-file-actions.types";

export interface MissingFilePopoverProps {
  file: FileInfo;
  actions: FileAction[];
  /** The card's button, which opens the popover instead of the file. */
  children: ReactNode;
}
