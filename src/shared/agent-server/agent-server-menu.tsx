import { Bot, Copy, Power } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { agentServerStatusText } from "./agent-server-status-text";
import { ConnectAgentDialog } from "./connect-agent-dialog";
import { copyText } from "./copy-agent-setup";
import { useAgentServerStatus } from "./use-agent-server-status";
import type { AgentServerMenuProps } from "./agent-server-menu.types";

/** Shows where agents connect (MCP) and opens the dialog that sets them up. */
export function AgentServerMenu({ trigger, align = "start" }: AgentServerMenuProps) {
  const status = useAgentServerStatus();
  const [connectOpen, setConnectOpen] = useState(false);
  const url = status.enabled ? status.url : null;

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && status.refresh()}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-72">
          <DropdownMenuLabel>Agents (MCP)</DropdownMenuLabel>
          <p className="px-2 pb-2 text-xs break-all text-muted-foreground">
            {agentServerStatusText(status.available, status.enabled, status.url)}
          </p>
          <DropdownMenuItem onSelect={() => setConnectOpen(true)}>
            <Bot />
            Connect an agent…
          </DropdownMenuItem>
          {status.available && (
            <>
              <DropdownMenuItem disabled={!url} onSelect={() => url && copyText(url, "URL copied")}>
                <Copy />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => status.setEnabled(!status.enabled)}>
                <Power />
                {status.enabled ? "Turn off agent access" : "Turn on agent access"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConnectAgentDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </>
  );
}
