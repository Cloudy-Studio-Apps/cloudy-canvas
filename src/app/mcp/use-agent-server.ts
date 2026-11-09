import { useEffect } from "react";

import { handleMcpMessage } from "@shared/core";
import { agentChannel } from "@platform";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../app.i18n";

/** How often agents that went silent are forgotten. */
const PRUNE_INTERVAL_MS = 30_000;

/** The side of the server that needs the products. */
const loadRuntime = () => import("./agent-runtime");

/** Answers agents' MCP requests from the platform's local endpoint while the app runs. */
export function useAgentServer(): void {
  const enabled = useAgentServerStore((state) => state.enabled);

  useEffect(() => {
    void agentChannel?.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    if (!agentChannel) return;
    const prune = () =>
      loadRuntime().then(
        ({ presence }) => presence.prune(Date.now()),
        // Whoever needed it first has said so.
        () => {},
      );
    const timer = setInterval(() => void prune(), PRUNE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = agentChannel;
    if (!channel) return;
    let stop: (() => void) | null = null;
    let disposed = false;
    void channel
      .listen(({ id, body, session, userAgent, ended, stream }) => {
        loadRuntime()
          .then(async ({ agentObserver, agentServer, agentTabs, presence, toolLists }) => {
            // Streams opening and closing expect no reply: they decide whether the session's tool
            // list is filtered.
            if (stream) {
              if (session === null) return;
              if (stream === "opened") toolLists.streamOpened(session);
              else toolLists.streamClosed(session);
              return;
            }
            if (ended) {
              if (session) {
                // First, so unbinding doesn't notify a session that's gone.
                toolLists.ended(session);
                presence.leave(session);
                agentTabs.unbind(session);
              }
              return;
            }
            const context = { session, userAgent };
            const reply = await handleMcpMessage(body, agentServer(), context, agentObserver);
            await channel.reply(id, reply.body, reply.session);
          })
          .catch((error: unknown) => notifyError(t("products.loadFailed"), error));
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
