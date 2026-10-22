import type { LucideIcon } from "lucide-react";

import type { DesignNode } from "@design";

export interface ArrangeButtonsProps {
  nodes: readonly DesignNode[];
}

/** One button: an engine command, enabled from `min` selected layers. */
export interface ArrangeButton {
  command: string;
  icon: LucideIcon;
  min?: number;
}
