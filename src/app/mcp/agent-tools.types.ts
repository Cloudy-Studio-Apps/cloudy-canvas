import type { CollectedMcpTool, CollectedMcpTools, RefusedMcpTool } from "@canvas";
import type { AgentHost } from "@board";
import type { DesignAgentHost } from "@design";
import type { AgentCallHost } from "./agent-server-definition.types";

/** The agent tools the server lists, and every plugin tool left out. */
export interface AgentTools {
  /** Each product's tools, as collected (before the clash check across products). */
  board: CollectedMcpTools<AgentHost>;
  design: CollectedMcpTools<DesignAgentHost>;
  /** What the server lists: the tab tools and both products' tools, names distinct. */
  served: CollectedMcpTool<AgentCallHost>[];
  /** Plugins' tools left out by either product or by the clash check across them. */
  refused: RefusedMcpTool[];
}
