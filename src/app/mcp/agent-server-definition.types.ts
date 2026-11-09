import type { FileType, McpMessageContext } from "@shared/core";
import type { FilesAgentHost, TabsAgentHost } from "@canvas";
import type { AgentHost } from "@board";
import type { DesignAgentHost } from "@design";

/** What a tool call reaches, whichever product the tool is from. */
export type AgentCallHost = AgentHost & DesignAgentHost & TabsAgentHost & FilesAgentHost;

export interface AgentServerOptions {
  /** The host of the agent making a call (its own workspace on its tab's file). */
  hostFor(context: McpMessageContext): AgentCallHost;
  /**
   * Runs before every tool call: readies the agent's tab (`prepareAgentCall`). Resolves with what
   * to run once the call settles.
   */
  prepare?(context: McpMessageContext): Promise<() => void>;
  /**
   * The product of the agent's tab, read when a product tool runs (after `prepare`): its bound
   * tab's type, else the active tab's, else `null` (no file).
   */
  productFor(context: McpMessageContext): FileType | null;
  /** The notes the agent is owed after a result. */
  notesFor?(context: McpMessageContext): string[];
}
