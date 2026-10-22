import { ExternalLink } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@shared/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { Switch } from "@shared/ui/components/ui/switch";
import { AGENT_CLIENTS } from "./agent-clients";
import { agentServerStatusText } from "./agent-server-status-text";
import { installInAgent } from "./copy-agent-setup";
import { CopyRow } from "./copy-row";
import { useAgentServerStatus } from "./use-agent-server-status";

/** Placeholder shown in the setup snippets until the server has a URL. */
const NO_URL = "http://127.0.0.1:47821/mcp";

/** The agent server's switch, status and setup snippets, for the settings page. */
export function AgentServerPanel() {
  const status = useAgentServerStatus();
  const { refresh } = status;
  const switchId = useId();
  const clientId = useId();
  const [clientKey, setClientKey] = useState(AGENT_CLIENTS[0]?.id ?? "");
  const client = AGENT_CLIENTS.find((c) => c.id === clientKey) ?? AGENT_CLIENTS[0];
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
      {status.available && client && (
        <div className="space-y-4">
          <CopyRow label="URL" value={url ?? NO_URL} disabled={!url} />
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={clientId} className="text-sm font-medium">
              Set up
            </label>
            <div className="flex items-center gap-2">
              {client.installLink && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!url}
                  onClick={() => url && installInAgent(client, url)}
                >
                  <ExternalLink />
                  Add to {client.label}
                </Button>
              )}
              <Select value={client.id} onValueChange={setClientKey}>
                <SelectTrigger id={clientId} className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_CLIENTS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CopyRow
            label={client.snippetLabel}
            value={client.snippet(url ?? NO_URL)}
            hint={client.where}
            disabled={!url}
          />
        </div>
      )}
    </div>
  );
}
