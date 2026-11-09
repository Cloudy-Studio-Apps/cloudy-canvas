import type { McpServerDefinition } from "@shared/core";
import { setAgentToolCatalog } from "@shared/agent-server";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { fileTabs } from "../tabs/file-tabs-instance";
import { agentHostFor } from "./agent-host";
import { presenceKey } from "./agent-presence-key";
import { createAgentPresenceSource } from "./agent-presence-source";
import { createAgentServerDefinition } from "./agent-server-definition";
import { createAgentTabs } from "./agent-tab-binding";
import { prepareAgentCall, presenceFileFor } from "./agent-tab-files";
import { agentToolCatalog } from "./agent-tool-catalog";
import { createUndoNotes } from "./agent-undo-notes";

// Everything of the agent server that needs the products; `use-agent-server.ts` imports this file
// when a request arrives or the products load, so it isn't part of the first page.

// The agent menu lists the tools agents see.
setAgentToolCatalog(agentToolCatalog);

/** What the user undid or redid of each agent's work, for its next reply. */
const undoNotes = createUndoNotes();

/** Which tab each agent session works in; moving to another one leaves the file it was in. */
export const agentTabs = createAgentTabs({
  tabs: fileTabs,
  leave: (session) => presence.leave(session),
});

/** Agents as collaborators, shown in the app; each works on the board or design of its tab. */
export const presence = createAgentPresenceSource({
  fileFor: (key) => presenceFileFor(agentTabs, key),
  isBound: (key) => agentTabs.tabFor(key) !== null,
  sink: useCollaboratorsStore.getState(),
  read: (id) => useCollaboratorsStore.getState().collaborators[id],
  all: () => Object.values(useCollaboratorsStore.getState().collaborators),
  notes: undoNotes,
});

let server: McpServerDefinition | null = null;

/**
 * The server agents see, made on the first request: by then the plugins have loaded, so their
 * tools are listed too. Each call runs in its agent's own workspace on its tab's file, once that
 * tab is ready.
 */
export function agentServer(): McpServerDefinition {
  server ??= createAgentServerDefinition({
    hostFor: (context) => agentHostFor(presenceKey(context), agentTabs),
    prepare: async (context) => {
      const key = presenceKey(context);
      const end = await prepareAgentCall(agentTabs, key);
      presence.prepared(key);
      return end;
    },
    notesFor: (context) => undoNotes.take(presenceKey(context)),
  });
  return server;
}
