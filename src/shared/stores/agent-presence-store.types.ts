/** What an agent is doing, or did last. */
export interface AgentActivity {
  /** The tool's MCP name, e.g. `create_shapes`. */
  tool: string;
  /** A sentence for people: "Creating shapes", then "Created 3 shapes". */
  label: string;
  startedAt: number;
  status: "running" | "done" | "error";
  /** The error's message when it failed. */
  error?: string;
}

/** Where an agent's cursor points: a world point in one file's scope (a design's page). */
export interface AgentCursorSpot {
  fileId: string;
  scope: string | null;
  x: number;
  y: number;
}

/** An agent connected to the app (one MCP session). */
export interface AgentPresence {
  /** Its MCP session, or a key made from its User-Agent when it keeps none. */
  key: string;
  /** The agent app's id (`AGENT_CLIENTS`), `"other"` when it isn't one of them. */
  clientId: string;
  /** "Claude Code", or "Claude Code 2" for a second one. */
  name: string;
  /** Its cursor's and ring's color, as `#rrggbb`. */
  color: string;
  connectedAt: number;
  /** When it last sent anything. */
  lastSeen: number;
  /** Tool calls not finished yet. */
  running: number;
  activity: AgentActivity | null;
  cursor: AgentCursorSpot | null;
}

/** Who an agent is, when it joins. */
export interface AgentIdentity {
  key: string;
  clientId: string;
  name: string;
  color: string;
}

export interface AgentPresenceState {
  /** By key, in the order they joined. */
  agents: Record<string, AgentPresence>;
  /** Adds the agent, or renews it when it reconnects. */
  join(identity: AgentIdentity): void;
  /** The agent sent something. */
  seen(key: string): void;
  leave(key: string): void;
  startCall(key: string, tool: string, label: string): void;
  finishCall(key: string, outcome: { label: string; ok: boolean; error?: string }): void;
  moveCursor(key: string, spot: AgentCursorSpot): void;
  /** Forgets agents silent for longer than `AGENT_GONE_MS`. */
  prune(now: number): void;
}
