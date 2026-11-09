import type { FileType } from "@shared/core";
import type {
  AgentToolList,
  AgentToolLists,
  AgentToolListsOptions,
} from "./agent-tool-lists.types";

/** The notice an agent re-reads its tool list on. */
export const TOOLS_LIST_CHANGED = JSON.stringify({
  jsonrpc: "2.0",
  method: "notifications/tools/list_changed",
});

/**
 * Tracks which tools each agent session lists (`AgentToolLists`). Only a session whose stream is
 * open **and** whose app has `refreshesTools` is filtered; the others (an unidentified app too)
 * list every tool and are never notified.
 */
export function createAgentToolLists({
  notify,
  productFor,
}: AgentToolListsOptions): AgentToolLists {
  const refreshing = new Set<string>();
  const streams = new Set<string>();
  /** What each session was last served or notified about. */
  const served = new Map<string, AgentToolList>();

  const isFiltered = (session: string) => streams.has(session) && refreshing.has(session);

  /** Tells a filtered session that listed before when its list is no longer what it was served. */
  const check = (session: string) => {
    if (!isFiltered(session) || !served.has(session)) return;
    const product = productFor(session);
    if (served.get(session) === product) return;
    served.set(session, product);
    // A stream that just closed drops it; the session's next `tools/list` is right anyway, so a
    // failure is ignored rather than reported on every tab change.
    notify(session, TOOLS_LIST_CHANGED).catch(() => undefined);
  };

  return {
    connected(session, client) {
      if (client.refreshesTools) refreshing.add(session);
      else refreshing.delete(session);
      check(session);
    },
    streamOpened(session) {
      streams.add(session);
      check(session);
    },
    streamClosed(session) {
      streams.delete(session);
    },
    ended(session) {
      refreshing.delete(session);
      streams.delete(session);
      served.delete(session);
    },
    filtered(session) {
      if (session === null) return "all";
      const list: AgentToolList = isFiltered(session) ? productFor(session) : "all";
      served.set(session, list);
      return list;
    },
    refresh() {
      for (const session of streams) check(session);
    },
  };
}

/**
 * Whether a tool of `products` (`toolProducts`: none for an app tool) is in `list`: every tool for
 * `"all"`; else the app tools, the shared ones (both products) and those of the list's product.
 */
export function listsTool(products: readonly FileType[], list: AgentToolList): boolean {
  if (list === "all" || products.length !== 1) return true;
  return products[0] === list;
}
