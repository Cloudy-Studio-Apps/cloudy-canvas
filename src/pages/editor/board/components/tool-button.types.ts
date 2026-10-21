import type { ComponentProps, ReactNode } from "react";

import type { Button } from "@ui/components/ui/button";

export interface ToolButtonProps extends Omit<ComponentProps<typeof Button>, "children"> {
  label: string;
  shortcut?: string;
  active?: boolean;
  children: ReactNode;
  side?: "top" | "bottom";
}
