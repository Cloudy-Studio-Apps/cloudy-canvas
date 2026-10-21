import { useAgentServer } from "./mcp";

/** Serves agents (MCP) for as long as the app runs. Renders nothing. */
export function AgentServer() {
  useAgentServer();
  return null;
}
