import { tCommon } from "@shared/core";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@shared/ui/components/ui/button";
import { DialogClose, DialogFooter } from "@shared/ui/components/ui/dialog";
import { AGENT_CLIENTS } from "../agent-clients";
import { useAgentServerStatus } from "../use-agent-server-status";
import { AgentAccessNotice } from "./agent-access-notice";
import { AgentClientGrid } from "./agent-client-grid";
import { AgentClientSetup } from "./agent-client-setup";
import { BackButton } from "./back-button";
import { ManualSetup } from "./manual-setup";
import type { ConnectAgentView } from "./connect-agent-dialog.types";
import { t } from "../agent-server.i18n";

const MAIN_CLIENTS = AGENT_CLIENTS.filter((client) => !client.more);
const MORE_CLIENTS = AGENT_CLIENTS.filter((client) => client.more);
const GRID: ConnectAgentView = { kind: "grid" };
const MORE: ConnectAgentView = { kind: "more" };

/** The dialog's views (the grid, other tools, one app, manual) and its footer. */
export function ConnectAgentBody() {
  const status = useAgentServerStatus();
  const { refresh } = status;
  const [view, setView] = useState<ConnectAgentView>(GRID);
  const url = status.enabled ? status.url : null;

  useEffect(refresh, [refresh, status.enabled]);

  return (
    <>
      <div className="flex min-h-80 flex-col gap-4 p-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{t("connect.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("connect.hint")}</p>
        </div>
        <AgentAccessNotice status={status} />
        {view.kind === "grid" && (
          <AgentClientGrid
            clients={MAIN_CLIENTS}
            onPick={(client) => setView({ kind: "client", client, back: "grid" })}
            onMore={MORE_CLIENTS.length > 0 ? () => setView(MORE) : undefined}
          />
        )}
        {view.kind === "more" && (
          <>
            <BackButton label={t("connect.allAgents")} onClick={() => setView(GRID)} />
            <AgentClientGrid
              clients={MORE_CLIENTS}
              onPick={(client) => setView({ kind: "client", client, back: "more" })}
            />
          </>
        )}
        {view.kind === "client" && (
          <>
            <BackButton
              label={view.back === "more" ? t("connect.otherTools") : t("connect.allAgents")}
              onClick={() => setView(view.back === "more" ? MORE : GRID)}
            />
            <AgentClientSetup client={view.client} url={url} />
          </>
        )}
        {view.kind === "manual" && (
          <>
            <BackButton label={t("connect.allAgents")} onClick={() => setView(GRID)} />
            <ManualSetup url={url} />
          </>
        )}
      </div>
      <DialogFooter className="justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          disabled={view.kind === "manual"}
          onClick={() => setView({ kind: "manual" })}
        >
          <SlidersHorizontal />
          {t("connect.manually")}
        </Button>
        <DialogClose asChild>
          <Button size="sm">{tCommon("done")}</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
