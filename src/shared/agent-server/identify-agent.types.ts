import type { AgentClient } from "./agent-clients.types";

/** Who an agent is, from what it sent when it connected. */
export interface IdentifiedAgent {
  /** One of `AGENT_CLIENTS`, or `GENERIC_AGENT_CLIENT`. */
  client: AgentClient;
  /** The app's name, or the name the agent gave when it isn't a known app. */
  name: string;
}
