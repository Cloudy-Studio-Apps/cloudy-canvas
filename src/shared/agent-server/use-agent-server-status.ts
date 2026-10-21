import { useCallback, useEffect, useState } from "react";

import { agentChannel } from "@platform";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import type { AgentServerStatusView } from "./use-agent-server-status.types";

/** The local agent endpoint's URL and on/off state, for the agent menu. */
export function useAgentServerStatus(): AgentServerStatusView {
  const enabled = useAgentServerStore((state) => state.enabled);
  const setEnabled = useAgentServerStore((state) => state.setEnabled);
  const [url, setUrl] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void agentChannel?.status().then((status) => setUrl(status.url));
  }, []);

  useEffect(refresh, [refresh]);

  return { available: agentChannel !== null, enabled, url, setEnabled, refresh };
}
