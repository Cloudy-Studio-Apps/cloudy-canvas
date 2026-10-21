import { Copy, Power, Terminal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { claudeCodeCommand, mcpJsonConfig } from "./agent-server-config";
import { agentServerStatusText } from "./agent-server-status-text";
import { useAgentServerStatus } from "./use-agent-server-status";
import type { AgentServerMenuProps } from "./agent-server-menu.types";

/** Shows where agents connect (MCP) and copies their setup. */
export function AgentServerMenu({ trigger, align = "start" }: AgentServerMenuProps) {
  const status = useAgentServerStatus();
  const url = status.enabled ? status.url : null;
  const copy = (text: string) => void navigator.clipboard.writeText(text);

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
            <DropdownMenuItem disabled={!url} onSelect={() => url && copy(url)}>
              <Copy />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!url} onSelect={() => url && copy(claudeCodeCommand(url))}>
              <Terminal />
              Copy Claude Code command
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!url} onSelect={() => url && copy(mcpJsonConfig(url))}>
              <Copy />
              Copy JSON config
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
  );
}
