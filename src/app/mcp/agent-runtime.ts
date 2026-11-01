import type { McpServerDefinition } from "@shared/core";
import { setAgentToolCatalog } from "@shared/agent-server";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { agentHostFor, openFile } from "./agent-host";
import { presenceKey } from "./agent-presence-key";
import { createAgentPresenceSource } from "./agent-presence-source";
import { createAgentServerDefinition } from "./agent-server-definition";
import { agentToolCatalog } from "./agent-tool-catalog";
import { createUndoNotes } from "./agent-undo-notes";

// Everything of the agent server that needs the products; `use-agent-server.ts` imports this file
// when a request arrives or the products load, so it isn't part of the first page.

// The agent menu lists the tools agents see.
setAgentToolCatalog(agentToolCatalog);

/** What the user undid or redid of each agent's work, for its next reply. */
const undoNotes = createUndoNotes();

/** Agents as collaborators, shown in the app; they work on the board or design open in the window. */
export const presence = createAgentPresenceSource({
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
export function agentServer(): McpServerDefinition {
  server ??= createAgentServerDefinition(
    (context) => agentHostFor(presenceKey(context)),
    (context) => undoNotes.take(presenceKey(context)),
  );
  return server;
}
