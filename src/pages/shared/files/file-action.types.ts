import type { LucideIcon } from "lucide-react";

export interface FileAction {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
  /** Drawn in the destructive color, after a separator. */
  destructive?: boolean;
}
