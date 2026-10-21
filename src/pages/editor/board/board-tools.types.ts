import type { LucideIcon } from "lucide-react";

import type { ToolId } from "@engine";

export interface BoardToolItem {
  id: ToolId;
  label: string;
  icon: LucideIcon;
}
