import { useEffect } from "react";

import { handleMcpMessage, type McpServerDefinition } from "@shared/core";
import { agentChannel } from "@platform";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { agentHost } from "./agent-host";
import { createAgentServerDefinition } from "./agent-server-definition";

let server: McpServerDefinition | null = null;

/**
 * The server agents see, made on the first request: by then the plugins have loaded, so their
 * tools are listed too.
 */
function agentServer(): McpServerDefinition {
  server ??= createAgentServerDefinition(agentHost);
  return server;
}

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
        void handleMcpMessage(body, agentServer()).then((reply) => channel.reply(id, reply));
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
