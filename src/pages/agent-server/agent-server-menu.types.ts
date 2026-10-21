import type { ReactNode } from "react";

export interface AgentServerMenuProps {
  /** The button that opens the menu (rendered with `asChild`). */
  trigger: ReactNode;
  align?: "start" | "end";
}
