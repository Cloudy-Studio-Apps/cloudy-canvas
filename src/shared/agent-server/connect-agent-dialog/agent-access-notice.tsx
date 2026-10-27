import { Power } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { agentServerStatusText } from "../agent-server-status-text";
import type { AgentAccessNoticeProps } from "./agent-access-notice.types";
import { t } from "../agent-server.i18n";

/** Says why agents can't connect yet (access off, or no desktop app), with a way to turn it on. */
export function AgentAccessNotice({ status }: AgentAccessNoticeProps) {
  if (status.available && status.enabled && status.url) return null;
  return (
    <div className="flex items-center gap-3 rounded-md border bg-surface-sunken px-3 py-2">
      <p className="flex-1 text-xs text-muted-foreground">
        {agentServerStatusText(status.available, status.enabled, status.url)}
      </p>
      {status.available && !status.enabled && (
        <Button size="sm" variant="outline" onClick={() => status.setEnabled(true)}>
          <Power />
          {t("connect.turnOn")}
        </Button>
      )}
    </div>
  );
}
