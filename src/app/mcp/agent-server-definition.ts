import type { McpServerDefinition } from "@shared/core";
import { AGENT_INSTRUCTIONS, createAgentTools, type AgentHost } from "@board";

const SERVER_NAME = "cloudy-canvas";
const SERVER_VERSION = "0.1.0";

/** The MCP server agents see: every agent tool, bound to the app's host. */
export function createAgentServerDefinition(host: AgentHost): McpServerDefinition {
  return {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    instructions: AGENT_INSTRUCTIONS,
    tools: createAgentTools().map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      run: (args) => tool.run(host, args),
    })),
  };
}
