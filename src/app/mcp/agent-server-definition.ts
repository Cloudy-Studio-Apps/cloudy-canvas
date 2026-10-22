import type { McpServerDefinition } from "@shared/core";
import { AGENT_INSTRUCTIONS, createAgentTools, type AgentHost } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { createDesignAgentTools, DESIGN_AGENT_INSTRUCTIONS, type DesignAgentHost } from "@design";
import { getDesignModules, getDesignProduct } from "@design/ui";
import { notifyError } from "@shared/stores/toast-store";

const SERVER_NAME = "cloudy-canvas";
const SERVER_VERSION = "0.1.0";

/** The MCP server agents see: every product's agent tools, bound to the app's host. */
export function createAgentServerDefinition(
  host: AgentHost & DesignAgentHost,
): McpServerDefinition {
  // One set of names for both products, so a design tool can't shadow a board tool.
  const taken = new Set<string>();
  const skipped = (tool: { name: string }, group: { id: string }) =>
    notifyError(
      "An agent tool was left out",
      new Error(`"${tool.name}" (from "${group.id}") has the name of another tool.`),
    );
  const tools = [
    ...createAgentTools(getBoardModules(), getBoardProduct().kinds, skipped, taken),
    ...createDesignAgentTools(getDesignModules(), getDesignProduct().kinds, skipped, taken),
  ];
  return {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    instructions: `${AGENT_INSTRUCTIONS}\n${DESIGN_AGENT_INSTRUCTIONS}`,
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      run: (args) => tool.run(host, args),
    })),
  };
}
