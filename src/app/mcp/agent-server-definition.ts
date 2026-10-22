import type { McpServerDefinition } from "@shared/core";
import { AGENT_INSTRUCTIONS, createAgentTools, type AgentHost } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { notifyError } from "@shared/stores/toast-store";

const SERVER_NAME = "cloudy-canvas";
const SERVER_VERSION = "0.1.0";

/** The MCP server agents see: every agent tool, bound to the app's host. */
export function createAgentServerDefinition(host: AgentHost): McpServerDefinition {
  return {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    instructions: AGENT_INSTRUCTIONS,
    tools: createAgentTools(getBoardModules(), getBoardProduct().kinds, (tool, group) =>
      notifyError(
        "An agent tool was left out",
        new Error(`"${tool.name}" (from "${group.id}") has the name of another tool.`),
      ),
    ).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      run: (args) => tool.run(host, args),
    })),
  };
}
