import type { CollectedMcpTool } from "@canvas";
import type { AgentHost } from "@board";
import type { DesignAgentHost } from "@design";
import type { AgentCallHost } from "./agent-server-definition.types";

/**
 * One tool the server lists, by its full name: an app tool (needs no file), or a product tool
 * with the implementation of each product that has it (both for a shared tool).
 */
export interface ProductTool {
  name: string;
  board?: CollectedMcpTool<AgentHost>;
  design?: CollectedMcpTool<DesignAgentHost>;
  /** A tool that needs no file: the tab tools and any `scope: "app"` tool. Alone when set. */
  app?: CollectedMcpTool<AgentCallHost>;
}
