import type { CollectedMcpTools } from "@canvas";
import type { AgentHost } from "@board";
import type { DesignAgentHost } from "@design";

/** Each product's agent tools, with their full names, and the plugins' tools left out. */
export interface AgentTools {
  board: CollectedMcpTools<AgentHost>;
  design: CollectedMcpTools<DesignAgentHost>;
}
