import { ExternalLink } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { AgentClientIconView } from "../agent-client-icon";
import { installInAgent } from "../copy-agent-setup";
import { CopyRow } from "../copy-row";
import { NO_URL } from "./no-url";
import type { AgentClientSetupProps } from "./connect-agent-dialog.types";
import { t } from "../agent-server.i18n";

/** One app's setup: its one-click install, when it has one, and the snippet to copy. */
export function AgentClientSetup({ client, url }: AgentClientSetupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <AgentClientIconView icon={client.icon} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{client.label}</p>
          <p className="text-xs text-muted-foreground">
            {client.installLink ? t("connect.oneClick") : client.where}
          </p>
        </div>
        {client.installLink && (
          <Button size="sm" disabled={!url} onClick={() => url && installInAgent(client, url)}>
            <ExternalLink />
            {t("connect.addTo", { client: client.label })}
          </Button>
        )}
      </div>
      <CopyRow
        label={client.snippetLabel}
        value={client.snippet(url ?? NO_URL)}
        hint={client.installLink ? client.where : undefined}
        disabled={!url}
      />
    </div>
  );
}
