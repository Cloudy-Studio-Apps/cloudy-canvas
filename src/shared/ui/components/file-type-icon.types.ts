import type { LucideIcon } from "lucide-react";

import type { FileType } from "@shared/core";

export interface FileTypeIconProps {
  type: FileType;
  size?: "sm" | "md" | "lg";
  /** Another icon and tint than the type's, for a kind of file shown apart (Home's catalogs). */
  style?: FileTypeStyle;
  className?: string;
}

export interface FileTypeStyle {
  icon: LucideIcon;
  className: string;
}
