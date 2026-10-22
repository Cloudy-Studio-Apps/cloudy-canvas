import type { DesignEngine } from "@design";
import type { FileInfo } from "@shared/core";

export interface DesignSessionProps {
  id: string;
  engine: DesignEngine;
  /** `null` for a new design that hasn't been saved yet. */
  info: FileInfo | null;
}
