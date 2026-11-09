import type { FileType } from "@shared/core";
import type { AgentClient } from "@shared/agent-server";

/** What a session's `tools/list` gives: every tool, or those of one product (`null`: no file). */
export type AgentToolList = FileType | null | "all";

export interface AgentToolListsOptions {
  /** Sends a JSON-RPC notification down the session's event stream (`AgentChannel.notify`). */
  notify(session: string, body: string): Promise<void>;
  /**
   * The product the session's list follows: its bound tab's type, else the active tab's, else
   * `null`. Read only, never throws (`agentListProductFor`).
   */
  productFor(session: string): FileType | null;
}

/**
 * Which tools each agent session lists (see the README): a session is **filtered** only while its
 * event stream is open and its app re-reads the list (`AgentClient.refreshesTools`); every other
 * one lists every tool.
 */
export interface AgentToolLists {
  /** The session connected (`initialize`) from `client`'s app. */
  connected(session: string, client: AgentClient): void;
  /** Its event stream opened; idempotent (a replacing GET opens it again). */
  streamOpened(session: string): void;
  streamClosed(session: string): void;
  /** The session ended: everything about it is forgotten. */
  ended(session: string): void;
  /**
   * What the session's `tools/list` gives now (`"all"` unless it's filtered), remembered as what
   * it was last served.
   */
  filtered(session: string | null): AgentToolList;
  /**
   * Re-reads each filtered session's product and sends `notifications/tools/list_changed` to
   * those whose product changed since they were last served or notified.
   */
  refresh(): void;
}
