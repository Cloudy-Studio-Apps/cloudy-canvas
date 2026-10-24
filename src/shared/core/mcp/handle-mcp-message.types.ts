import type { McpMessageContext, McpObserver, McpServerDefinition } from "./mcp.types";

/** One message being handled: who sent it, who hears about it, and the session to answer with. */
export interface Exchange {
  server: McpServerDefinition;
  context: McpMessageContext;
  observer: McpObserver | undefined;
  session: string | null;
}
