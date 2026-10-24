import type { ReactNode } from "react";

import type { Collaborator } from "@shared/core";

export interface AgentServerMenuProps {
  /** The button that opens the menu (rendered with `asChild`). */
  trigger: ReactNode;
  align?: "start" | "end";
  /** Picking a connected agent follows it (in an editor; not on Home). */
  followable?: boolean;
  /** Buttons after each connected agent (an editor's undo of its last step). */
  agentActions?: (agent: Collaborator) => ReactNode;
}
