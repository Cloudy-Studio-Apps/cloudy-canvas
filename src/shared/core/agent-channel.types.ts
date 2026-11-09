/** A raw MCP message from an agent, forwarded by the platform's local endpoint. */
export interface AgentMessage {
  id: number;
  body: string;
  /** The agent's MCP session (`Mcp-Session-Id`), `null` before it has one. */
  session: string | null;
  userAgent: string | null;
  /** The agent ended its session; there is nothing to answer. */
  ended: boolean;
  /**
   * The session's event stream (an MCP GET) opened or closed; there is nothing to answer. Left
   * out for every other message.
   */
  stream?: AgentStreamChange;
}

/** What happened to a session's event stream. */
export type AgentStreamChange = "opened" | "closed";

export interface AgentServerStatus {
  /** Where agents connect, or `null` while (or if) the endpoint isn't listening. */
  url: string | null;
  enabled: boolean;
}

/**
 * Where agent (MCP) requests come from. Implemented per platform in `platform/` (desktop: a local
 * HTTP endpoint in the Tauri shell); there is none where the app can't listen (web).
 */
export interface AgentChannel {
  /** Calls `handler` for each message; resolves to the function that stops listening. */
  listen(handler: (message: AgentMessage) => void): Promise<() => void>;
  /**
   * Answers message `id`. An empty body means there is no response (a notification); `session`
   * is sent back as the agent's `Mcp-Session-Id`.
   */
  reply(id: number, body: string, session: string | null): Promise<void>;
  status(): Promise<AgentServerStatus>;
  setEnabled(enabled: boolean): Promise<void>;
  /**
   * Sends `body` (a JSON-RPC notification) down `session`'s event stream. A session without an
   * open stream drops it and this still resolves: there is nothing to report.
   */
  notify(session: string, body: string): Promise<void>;
}
