import { Blocks } from "lucide-react";

import { AgentClientIconView } from "../agent-client-icon";
import { AgentClientCard } from "./agent-client-card";
import type { AgentClientGridProps } from "./connect-agent-dialog.types";

/** The apps as cards, three to a row, with an "Other AI tools" card last. */
export function AgentClientGrid({ clients, onPick, onMore }: AgentClientGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {clients.map((client) => (
        <AgentClientCard
          key={client.id}
          icon={<AgentClientIconView icon={client.icon} />}
          label={client.label}
          action="add"
          onClick={() => onPick(client)}
        />
      ))}
      {onMore && (
        <AgentClientCard
          icon={<AgentClientIconView icon={Blocks} className="text-muted-foreground" />}
          label="Other AI tools"
          action="open"
          onClick={onMore}
        />
      )}
    </div>
  );
}
