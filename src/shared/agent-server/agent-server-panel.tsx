import { Bot, Wrench } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@shared/ui/components/ui/button";
import { Switch } from "@shared/ui/components/ui/switch";
import { agentServerStatusText } from "./agent-server-status-text";
import { AgentToolsDialog } from "./agent-tools-dialog";
import { ConnectAgentDialog } from "./connect-agent-dialog";
import { NO_URL } from "./connect-agent-dialog/no-url";
import { CopyRow } from "./copy-row";
import { useAgentServerStatus } from "./use-agent-server-status";

/** The agent server's switch, status and URL, for the settings page, with the connect dialog. */
export function AgentServerPanel() {
  const status = useAgentServerStatus();
  const { refresh } = status;
  const switchId = useId();
  const [connectOpen, setConnectOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const url = status.enabled ? status.url : null;

  useEffect(refresh, [refresh, status.enabled]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <label htmlFor={switchId} className="text-sm font-medium">
            Allow agents to connect
          </label>
          <p className="text-sm break-all text-muted-foreground">
            {agentServerStatusText(status.available, status.enabled, status.url)}
          </p>
        </div>
        <Switch
          id={switchId}
          checked={status.enabled}
          disabled={!status.available}
          onCheckedChange={status.setEnabled}
        />
      </div>
      {status.available && (
        <div className="space-y-4">
          <CopyRow label="URL" value={url ?? NO_URL} disabled={!url} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setConnectOpen(true)}>
              <Bot />
              Connect an agent…
            </Button>
            <Button variant="outline" size="sm" onClick={() => setToolsOpen(true)}>
              <Wrench />
              Available tools…
            </Button>
          </div>
        </div>
      )}
      <ConnectAgentDialog open={connectOpen} onOpenChange={setConnectOpen} />
      <AgentToolsDialog open={toolsOpen} onOpenChange={setToolsOpen} />
    </div>
  );
}
