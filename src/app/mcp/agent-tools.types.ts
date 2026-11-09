import type { CollectedMcpTools, RefusedMcpTool } from "@canvas";
import type { AgentHost } from "@board";
import type { DesignAgentHost } from "@design";
import type { ProductTool } from "./agent-tool-dispatch.types";

/** The agent tools the server lists, and every plugin tool left out. */
export interface AgentTools {
  /** Each product's tools, as collected (before the clash check across products). */
  board: CollectedMcpTools<AgentHost>;
  design: CollectedMcpTools<DesignAgentHost>;
  /**
   * What the server lists, one per name (`mergeProductTools`): the app tools (the tab tools and
   * every `scope: "app"` tool), then the products' tools, a shared one once for both.
   */
  served: ProductTool[];
  /** Plugins' tools left out by either product or by the clash check across them. */
  refused: RefusedMcpTool[];
}
