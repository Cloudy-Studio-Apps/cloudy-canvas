import type { McpServerDefinition } from "@shared/core";
import { BOARD_MCP_INSTRUCTIONS } from "@board";
import { DESIGN_MCP_INSTRUCTIONS } from "@design";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../app.i18n";
import type { AgentServerOptions } from "./agent-server-definition.types";
import { runAgentTool } from "./agent-tool-dispatch";
import { agentTools } from "./agent-tools";
import { listedTool } from "./merge-product-tools";

const SERVER_NAME = "cloudy-canvas";
const SERVER_VERSION = "0.1.0";

/**
 * The MCP server agents see: one tool per name (a shared tool once for both products), each call
 * run by `runAgentTool` on the host of the agent making it (`hostFor`: its own workspace on its
 * tab's file) after `prepare` readied that tab, with the implementation of that tab's product
 * (`productFor`), and the notes it's owed. A plugin's tool that was refused is reported once.
 */
export function createAgentServerDefinition(options: AgentServerOptions): McpServerDefinition {
  const { notesFor } = options;
  const { served: tools, refused } = agentTools();
  for (const { name, pluginId, reason } of refused) {
    notifyError(t("mcp.toolLeftOut"), new Error(`"${name}" (plugin "${pluginId}"): ${reason}`));
  }
  return {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    instructions: `${BOARD_MCP_INSTRUCTIONS}\n${DESIGN_MCP_INSTRUCTIONS}`,
    tools: tools.map((served) => {
      const { tool } = listedTool(served);
      return {
        name: served.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        run: (args, context) => runAgentTool(served, options, context, args),
      };
    }),
    ...(notesFor ? { notesFor } : {}),
  };
}
