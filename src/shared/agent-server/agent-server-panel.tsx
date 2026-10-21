import { useEffect, useId } from "react";

import { Switch } from "@shared/ui/components/ui/switch";
import { claudeCodeCommand, mcpJsonConfig } from "./agent-server-config";
import { agentServerStatusText } from "./agent-server-status-text";
import { CopyRow } from "./copy-row";
import { useAgentServerStatus } from "./use-agent-server-status";

/** Placeholder shown in the setup snippets until the server has a URL. */
const NO_URL = "http://127.0.0.1:47821/mcp";

/** The agent server's switch, status and setup snippets, for the settings page. */
export function AgentServerPanel() {
  const status = useAgentServerStatus();
  const { refresh } = status;
  const switchId = useId();
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
          <CopyRow
            label="Claude Code command"
            value={claudeCodeCommand(url ?? NO_URL)}
            disabled={!url}
          />
          <CopyRow label="JSON config" value={mcpJsonConfig(url ?? NO_URL)} disabled={!url} />
        </div>
      )}
    </div>
  );
}
