import type { ReactNode } from "react";

import type { AgentClient } from "../agent-clients.types";

export interface ConnectAgentDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

/** What the dialog shows: the main grid, the other tools, one app's setup or the manual setup. */
export type ConnectAgentView =
  | { kind: "grid" }
  | { kind: "more" }
  | { kind: "manual" }
  | { kind: "client"; client: AgentClient; back: "grid" | "more" };

export interface AgentClientCardProps {
  icon: ReactNode;
  label: string;
  /** "+" for an app, a chevron for a list. */
  action: "add" | "open";
  onClick(): void;
}

export interface AgentClientGridProps {
  clients: readonly AgentClient[];
  onPick(client: AgentClient): void;
  /** Adds the "Other AI tools" card. */
  onMore?: () => void;
}

export interface AgentClientSetupProps {
  client: AgentClient;
  /** The server's URL, or `null` while agent access is off. */
  url: string | null;
}

export interface ManualSetupProps {
  url: string | null;
}

export interface BackButtonProps {
  label: string;
  onClick(): void;
}
