/** A raw MCP message from an agent, forwarded by the platform's local endpoint. */
export interface AgentMessage {
  id: number;
  body: string;
}

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
  /** Answers message `id`. An empty body means there is no response (a notification). */
  reply(id: number, body: string): Promise<void>;
  status(): Promise<AgentServerStatus>;
  setEnabled(enabled: boolean): Promise<void>;
}
