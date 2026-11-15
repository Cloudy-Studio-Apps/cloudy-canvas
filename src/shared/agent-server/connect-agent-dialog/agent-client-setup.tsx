import { Check, ExternalLink, Plus } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { AgentClientIconView } from "../agent-client-icon";
import { installInAgent } from "../copy-agent-setup";
import { CopyRow } from "../copy-row";
import { useAgentConfig } from "../use-agent-config";
import { NO_URL } from "./no-url";
import type { AgentClientSetupProps } from "./connect-agent-dialog.types";
import { t } from "../agent-server.i18n";

/**
 * One app's setup: its one-click install (a link, or writing its config file when the app is
 * installed) and the snippet to copy.
 */
export function AgentClientSetup({ client, url }: AgentClientSetupProps) {
  const config = useAgentConfig(client, url);
  const detected = config.state === "ready" || config.state === "installed";
  const oneClick = Boolean(client.installLink) || detected;
  const addTo = t("connect.addTo", { client: client.label });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <AgentClientIconView icon={client.icon} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{client.label}</p>
          <p className="text-xs text-muted-foreground">
            {oneClick ? t("connect.oneClick") : client.where}
          </p>
        </div>
        {client.installLink && (
          <Button size="sm" disabled={!url} onClick={() => url && installInAgent(client, url)}>
            <ExternalLink />
            {addTo}
          </Button>
        )}
        {config.state === "ready" && (
          <Button size="sm" disabled={!url} onClick={config.install}>
            <Plus />
            {addTo}
          </Button>
        )}
        {config.state === "installed" && (
          <Button size="sm" variant="outline" disabled>
            <Check />
            {t("connect.added", { client: client.label })}
          </Button>
        )}
      </div>
      <CopyRow
        label={client.snippetLabel}
        value={client.snippet(url ?? NO_URL)}
        hint={oneClick ? client.where : undefined}
        disabled={!url}
      />
    </div>
  );
}
