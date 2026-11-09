import type { McpMessageContext } from "@shared/core";
import type { TabsAgentHost } from "@canvas";
import type { AgentHost } from "@board";
import type { DesignAgentHost } from "@design";

export interface AgentServerOptions {
  /** The host of the agent making a call (its own workspace on its tab's file). */
  hostFor(context: McpMessageContext): AgentHost & DesignAgentHost & TabsAgentHost;
  /**
   * Runs before every tool call: readies the agent's tab (`prepareAgentCall`). Resolves with what
   * to run once the call settles.
   */
  prepare?(context: McpMessageContext): Promise<() => void>;
  /** The notes the agent is owed after a result. */
  notesFor?(context: McpMessageContext): string[];
}
