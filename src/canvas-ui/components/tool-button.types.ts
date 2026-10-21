import type { ComponentProps, ReactNode } from "react";

import type { Button } from "@shared/ui/components/ui/button";

export interface ToolButtonProps extends Omit<ComponentProps<typeof Button>, "children"> {
  label: string;
  /** A second, muted line in the tooltip. */
  description?: string;
  shortcut?: string;
  active?: boolean;
  children: ReactNode;
  side?: "top" | "bottom";
}
