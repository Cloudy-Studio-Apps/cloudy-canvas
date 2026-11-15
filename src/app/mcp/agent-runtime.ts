import type { McpObserver, McpServerDefinition } from "@shared/core";
import { VARIANTS_WAIT_MESSAGE } from "@canvas";
import { variantChoices } from "@canvas-ui";
import { agentChannel } from "@platform";
import { identifyAgent, setAgentToolCatalog } from "@shared/agent-server";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { fileTabs } from "../tabs/file-tabs-instance";
import { agentHostFor } from "./agent-host";
import { presenceKey } from "./agent-presence-key";
import { createAgentPresenceSource } from "./agent-presence-source";
import { createAgentServerDefinition } from "./agent-server-definition";
import { createAgentTabs } from "./agent-tab-binding";
import {
  agentListProductFor,
  agentProductFor,
  prepareAgentCall,
  presenceFileFor,
} from "./agent-tab-files";
import { agentToolCatalog } from "./agent-tool-catalog";
import { createAgentToolLists } from "./agent-tool-lists";
import { createUndoNotes } from "./agent-undo-notes";

// Everything of the agent server that needs the products; `use-agent-server.ts` imports this file
// when a request arrives or the products load, so it isn't part of the first page.

// The agent menu lists the tools agents see.
setAgentToolCatalog(agentToolCatalog);

/** Re-exported for `use-agent-server.ts`, which loads this file lazily. */
export { variantChoices };

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

/**
 * Which tools each session lists: an agent whose app re-reads the list, with its stream open, sees
 * its tab's product only and is told when that changes (active tab, tabs closing, bindings).
 */
export const toolLists = createAgentToolLists({
  notify: (session, body) => agentChannel?.notify(session, body) ?? Promise.resolve(),
  productFor: (session) => agentListProductFor(agentTabs, session),
});
fileTabs.store.subscribe(() => {
  toolLists.refresh();
  // A closed tab's chooser is dismissed, so an agent waiting on it gets its answer.
  for (const tabId of Object.keys(variantChoices.store.get().byTab)) {
    if (!fileTabs.get(tabId)) variantChoices.dropTab(tabId);
  }
});

/** Hears agents for their presence and, once they're identified, for their tool lists. */
export const agentObserver: McpObserver = {
  connected(session, client, context) {
    presence.connected?.(session, client, context);
    toolLists.connected(session, identifyAgent(client?.name ?? null, context.userAgent).client);
  },
  seen: (context) => presence.seen?.(context),
  toolCall: (name, args, context) => presence.toolCall?.(name, args, context),
};

/** The one call an agent waiting for the user's pick may still make. */
const VARIANTS_CHOICE_TOOL = "variants_choice";

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
      try {
        presence.prepared(key);
      } catch (error) {
        // The call won't run, so its tab mustn't stay pinned.
        end();
        throw error;
      }
      return end;
    },
    productFor: (context) => agentProductFor(agentTabs, presenceKey(context)),
    listFor: (context) => toolLists.filtered(context.session),
    // A call the lock refuses takes no notes: they wait for the first call that runs.
    refuse: (context, name) =>
      name !== VARIANTS_CHOICE_TOOL && variantChoices.isLocked(presenceKey(context))
        ? VARIANTS_WAIT_MESSAGE
        : null,
    notesFor: (context) => {
      const key = presenceKey(context);
      if (variantChoices.isLocked(key)) return [];
      const note = variantChoices.takeNote(key);
      return [...undoNotes.take(key), ...(note === null ? [] : [note])];
    },
  });
  return server;
}
