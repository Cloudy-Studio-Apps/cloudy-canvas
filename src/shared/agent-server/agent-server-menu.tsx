import { Bot, Copy, ExternalLink, Power } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { AGENT_CLIENTS } from "./agent-clients";
import { agentServerStatusText } from "./agent-server-status-text";
import { copyAgentSetup, copyText, installInAgent } from "./copy-agent-setup";
import { useAgentServerStatus } from "./use-agent-server-status";
import type { AgentServerMenuProps } from "./agent-server-menu.types";

const INSTALLABLE = AGENT_CLIENTS.filter((client) => client.installLink);

/** Shows where agents connect (MCP) and copies their setup. */
export function AgentServerMenu({ trigger, align = "start" }: AgentServerMenuProps) {
  const status = useAgentServerStatus();
  const url = status.enabled ? status.url : null;

  return (
    <DropdownMenu onOpenChange={(open) => open && status.refresh()}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-72">
        <DropdownMenuLabel>Agents (MCP)</DropdownMenuLabel>
        <p className="px-2 pb-2 text-xs break-all text-muted-foreground">
          {agentServerStatusText(status.available, status.enabled, status.url)}
        </p>
        {status.available && (
          <>
            <DropdownMenuItem disabled={!url} onSelect={() => url && copyText(url, "URL copied")}>
              <Copy />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={!url}>
                <Bot />
                Connect an agent
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Copy the setup for
                </DropdownMenuLabel>
                {AGENT_CLIENTS.map((client) => (
                  <DropdownMenuItem
                    key={client.id}
                    onSelect={() => url && copyAgentSetup(client, url)}
                  >
                    <Copy />
                    {client.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {INSTALLABLE.map((client) => (
                  <DropdownMenuItem
                    key={client.id}
                    onSelect={() => url && installInAgent(client, url)}
                  >
                    <ExternalLink />
                    Add to {client.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => status.setEnabled(!status.enabled)}>
              <Power />
              {status.enabled ? "Turn off agent access" : "Turn on agent access"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
