import { ChevronRight, Plus } from "lucide-react";

import type { AgentClientCardProps } from "./connect-agent-dialog.types";

/** One app in the grid: its logo, its name and what clicking does. */
export function AgentClientCard({ icon, label, action, onClick }: AgentClientCardProps) {
  const Action = action === "add" ? Plus : ChevronRight;
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: an agent app's card with its logo
    <button
      type="button"
      onClick={onClick}
      className="flex h-16 items-center gap-3 rounded-card border bg-surface px-3 text-left text-sm font-medium transition-colors outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <Action className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
