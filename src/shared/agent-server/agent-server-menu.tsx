import { Bot, Copy, MousePointer2, Power, Wrench } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { AGENT_SOURCE } from "@shared/core";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { CollaboratorList } from "@shared/collaborators";
import { agentServerStatusText } from "./agent-server-status-text";
import { AgentToolsDialog } from "./agent-tools-dialog";
import { ConnectAgentDialog } from "./connect-agent-dialog";
import { copyText } from "./copy-agent-setup";
import { useAgentServerStatus } from "./use-agent-server-status";
import type { AgentServerMenuProps } from "./agent-server-menu.types";
import { t } from "./agent-server.i18n";

/** Shows where agents connect (MCP) and opens the dialog that sets them up. */
export function AgentServerMenu({
  trigger,
  align = "start",
  side = "bottom",
  followable = false,
  agentActions,
}: AgentServerMenuProps) {
  const status = useAgentServerStatus();
  const [connectOpen, setConnectOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const url = status.enabled ? status.url : null;
  const showCollaborators = useAgentServerStore((state) => state.showCollaborators);
  const setShowCollaborators = useAgentServerStore((state) => state.setShowCollaborators);

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && status.refresh()}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent side={side} align={align} className="w-72">
          <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
          <p className="px-2 pb-2 text-xs break-all text-muted-foreground">
            {agentServerStatusText(status.available, status.enabled, status.url)}
          </p>
          <DropdownMenuItem onSelect={() => setConnectOpen(true)}>
            <Bot />
            {t("menu.connect")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setToolsOpen(true)}>
            <Wrench />
            {t("menu.tools")}
          </DropdownMenuItem>
          {status.available && status.enabled && (
            <>
              <DropdownMenuSeparator />
              <CollaboratorList
                kind="agent"
                source={AGENT_SOURCE}
                followable={followable}
                actions={agentActions}
              />
              <DropdownMenuCheckboxItem
                checked={showCollaborators}
                onCheckedChange={setShowCollaborators}
                onSelect={(event) => event.preventDefault()}
              >
                <MousePointer2 />
                {t("menu.showCursors")}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
            </>
          )}
          {status.available && (
            <>
              <DropdownMenuItem
                disabled={!url}
                onSelect={() => url && copyText(url, t("menu.urlCopied"))}
              >
                <Copy />
                {t("menu.copyUrl")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => status.setEnabled(!status.enabled)}>
                <Power />
                {status.enabled ? t("menu.turnOff") : t("menu.turnOn")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConnectAgentDialog open={connectOpen} onOpenChange={setConnectOpen} />
      <AgentToolsDialog open={toolsOpen} onOpenChange={setToolsOpen} />
    </>
  );
}
