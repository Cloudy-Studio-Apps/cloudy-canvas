import type { McpMessageContext, McpServerDefinition } from "@shared/core";
import { AGENT_INSTRUCTIONS, createAgentTools, type AgentHost } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { createDesignAgentTools, DESIGN_AGENT_INSTRUCTIONS, type DesignAgentHost } from "@design";
import { getDesignModules, getDesignProduct } from "@design/ui";
import { notifyError } from "@shared/stores/toast-store";

const SERVER_NAME = "cloudy-canvas";
const SERVER_VERSION = "0.1.0";

/**
 * The MCP server agents see: every product's agent tools, each call bound to the host of the
 * agent making it (`hostFor`: its own workspace on the open file), and the notes it's owed.
 */
export function createAgentServerDefinition(
  hostFor: (context: McpMessageContext) => AgentHost & DesignAgentHost,
  notesFor?: (context: McpMessageContext) => string[],
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
      run: (args, context) => tool.run(hostFor(context), args),
    })),
    ...(notesFor ? { notesFor } : {}),
  };
}
