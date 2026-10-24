import { useEffect } from "react";

import { handleMcpMessage, type McpServerDefinition } from "@shared/core";
import { agentChannel } from "@platform";
import { setAgentToolCatalog } from "@shared/agent-server";
import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { agentHostFor, openFile } from "./agent-host";
import { presenceKey } from "./agent-presence-key";
import { createAgentPresenceSource } from "./agent-presence-source";
import { createAgentServerDefinition } from "./agent-server-definition";
import { agentToolCatalog } from "./agent-tool-catalog";
import { createUndoNotes } from "./agent-undo-notes";

// The agent menu lists the tools agents see.
setAgentToolCatalog(agentToolCatalog);

/** How often agents that went silent are forgotten. */
const PRUNE_INTERVAL_MS = 30_000;

/** What the user undid or redid of each agent's work, for its next reply. */
const undoNotes = createUndoNotes();

/** Agents as collaborators, shown in the app; they work on the board or design open in the window. */
const presence = createAgentPresenceSource({
  openFile,
  sink: useCollaboratorsStore.getState(),
  read: (id) => useCollaboratorsStore.getState().collaborators[id],
  all: () => Object.values(useCollaboratorsStore.getState().collaborators),
  notes: undoNotes,
});

let server: McpServerDefinition | null = null;

/**
 * The server agents see, made on the first request: by then the plugins have loaded, so their
 * tools are listed too. Each call runs in its agent's own workspace.
 */
function agentServer(): McpServerDefinition {
  server ??= createAgentServerDefinition(
    (context) => agentHostFor(presenceKey(context)),
    (context) => undoNotes.take(presenceKey(context)),
  );
  return server;
}

/** Answers agents' MCP requests from the platform's local endpoint while the app runs. */
export function useAgentServer(): void {
  const enabled = useAgentServerStore((state) => state.enabled);

  useEffect(() => {
    void agentChannel?.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    const timer = setInterval(() => presence.prune(Date.now()), PRUNE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = agentChannel;
    if (!channel) return;
    let stop: (() => void) | null = null;
    let disposed = false;
    void channel
      .listen(({ id, body, session, userAgent, ended }) => {
        if (ended) {
          if (session) presence.leave(session);
          return;
        }
        void handleMcpMessage(body, agentServer(), { session, userAgent }, presence).then((reply) =>
          channel.reply(id, reply.body, reply.session),
        );
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
