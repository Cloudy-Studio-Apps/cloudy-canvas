import type { McpServerDefinition } from "@shared/core";
import { BOARD_MCP_INSTRUCTIONS } from "@board";
import { DESIGN_MCP_INSTRUCTIONS } from "@design";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../app.i18n";
import type { AgentServerOptions } from "./agent-server-definition.types";
import { agentTools } from "./agent-tools";

const SERVER_NAME = "cloudy-canvas";
const SERVER_VERSION = "0.1.0";

/**
 * The MCP server agents see: every product's agent tools, each call bound to the host of the
 * agent making it (`hostFor`: its own workspace on its tab's file) after `prepare` readied that
 * tab, and the notes it's owed. A plugin's tool that was refused is reported once.
 */
export function createAgentServerDefinition({
  hostFor,
  prepare,
  notesFor,
}: AgentServerOptions): McpServerDefinition {
  const { served: tools, refused } = agentTools();
  for (const { name, pluginId, reason } of refused) {
    notifyError(t("mcp.toolLeftOut"), new Error(`"${name}" (plugin "${pluginId}"): ${reason}`));
  }
  return {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    instructions: `${BOARD_MCP_INSTRUCTIONS}\n${DESIGN_MCP_INSTRUCTIONS}`,
    tools: tools.map(({ name, tool }) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      run: async (args, context) => {
        const end = await prepare?.(context);
        try {
          return await tool.run(hostFor(context), args);
        } finally {
          end?.();
        }
      },
    })),
    ...(notesFor ? { notesFor } : {}),
  };
}
