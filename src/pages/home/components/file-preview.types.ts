import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "../file-kind.types";

export interface FilePreviewProps {
  file: FileInfo;
  kind: HomeFileKind;
  /** The file isn't where it was last seen: a faded icon, no picture. */
  missing: boolean;
  /** The icon shown while there's no picture; `null` shows none (small previews). */
  iconSize?: "sm" | "md" | "lg" | null;
  className?: string;
}
