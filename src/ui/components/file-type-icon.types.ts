import type { LucideIcon } from "lucide-react";

import type { FileType } from "@core";

export interface FileTypeIconProps {
  type: FileType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface FileTypeStyle {
  icon: LucideIcon;
  className: string;
}
