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
          <h2 className="text-base font-semibold">Connect Cloudy Canvas to your agents</h2>
          <p className="text-xs text-muted-foreground">
            Agents can read and edit the open board or design while you watch. Pick the one you use.
          </p>
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
            <BackButton label="All agents" onClick={() => setView(GRID)} />
            <AgentClientGrid
              clients={MORE_CLIENTS}
              onPick={(client) => setView({ kind: "client", client, back: "more" })}
            />
          </>
        )}
        {view.kind === "client" && (
          <>
            <BackButton
              label={view.back === "more" ? "Other AI tools" : "All agents"}
              onClick={() => setView(view.back === "more" ? MORE : GRID)}
            />
            <AgentClientSetup client={view.client} url={url} />
          </>
        )}
        {view.kind === "manual" && (
          <>
            <BackButton label="All agents" onClick={() => setView(GRID)} />
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
          Install manually
        </Button>
        <DialogClose asChild>
          <Button size="sm">Done</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
