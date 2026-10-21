import { useEffect } from "react";

import { handleMcpMessage } from "@core";
import { agentChannel } from "@platform";
import { useAgentServerStore } from "@stores/agent-server-store";
import { agentHost } from "./agent-host";
import { createAgentServerDefinition } from "./agent-server-definition";

const server = createAgentServerDefinition(agentHost);

/** Answers agents' MCP requests from the platform's local endpoint while the app runs. */
export function useAgentServer(): void {
  const enabled = useAgentServerStore((state) => state.enabled);

  useEffect(() => {
    void agentChannel?.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    const channel = agentChannel;
    if (!channel) return;
    let stop: (() => void) | null = null;
    let disposed = false;
    void channel
      .listen(({ id, body }) => {
        void handleMcpMessage(body, server).then((reply) => channel.reply(id, reply));
      })
      .then((unlisten) => {
        if (disposed) unlisten();
        else stop = unlisten;
      });
    return () => {
      disposed = true;
      stop?.();
    };
  }, []);
}
