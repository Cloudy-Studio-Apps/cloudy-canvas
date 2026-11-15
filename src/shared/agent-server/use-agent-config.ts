import { useCallback, useEffect, useState } from "react";

import { notifyError, toast } from "@shared/stores/toast-store";
import { agentConfigState, installAgentConfig } from "./agent-config";
import type { AgentClient } from "./agent-clients.types";
import type { AgentConfigInstall, AgentConfigState } from "./agent-config.types";
import { t } from "./agent-server.i18n";

/** Whether the app is installed and has the server, and adding it to the app's config file. */
export function useAgentConfig(client: AgentClient, url: string | null): AgentConfigInstall {
  const file = client.configFile;
  const [state, setState] = useState<AgentConfigState | null>(null);

  useEffect(() => {
    if (!file) return;
    let current = true;
    agentConfigState(file, url).then(
      (next) => current && setState(next),
      () => current && setState("absent"),
    );
    return () => {
      current = false;
      setState(null);
    };
  }, [file, url]);

  const install = useCallback(() => {
    if (!file || !url) return;
    installAgentConfig(file, url).then(
      () => {
        setState("installed");
        toast({ title: t("install.done", { client: client.label }), description: file.done });
      },
      (error: unknown) => notifyError(t("install.failed", { client: client.label }), error),
    );
  }, [client.label, file, url]);

  return { state: file ? state : null, install };
}
