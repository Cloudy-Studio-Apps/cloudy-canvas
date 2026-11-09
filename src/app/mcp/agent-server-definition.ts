import type { McpServerDefinition, McpServerTool } from "@shared/core";
import { SHARED_MCP_INSTRUCTIONS } from "@canvas";
import { BOARD_MCP_INSTRUCTIONS } from "@board";
import { DESIGN_MCP_INSTRUCTIONS } from "@design";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../app.i18n";
import type { AgentServerOptions } from "./agent-server-definition.types";
import { runAgentTool, toolProducts } from "./agent-tool-dispatch";
import { listsTool } from "./agent-tool-lists";
import { agentTools } from "./agent-tools";
import { listedTool } from "./merge-product-tools";

const SERVER_NAME = "cloudy-canvas";
const SERVER_VERSION = "0.1.0";

/**
 * The MCP server agents see: one tool per name (a shared tool once for both products), each call
 * run by `runAgentTool` on the host of the agent making it (`hostFor`: its own workspace on its
 * tab's file) after `prepare` readied that tab, with the implementation of that tab's product
 * (`productFor`), and the notes it's owed. `listFor` narrows what an agent's `tools/list` gives
 * (`listsTool`); every tool can still be called. A plugin's tool that was refused is reported once.
 */
export function createAgentServerDefinition(options: AgentServerOptions): McpServerDefinition {
  const { notesFor, listFor } = options;
  const { served: tools, refused } = agentTools();
  for (const { name, pluginId, reason } of refused) {
    notifyError(t("mcp.toolLeftOut"), new Error(`"${name}" (plugin "${pluginId}"): ${reason}`));
  }
  const listed = tools.map((served) => {
    const { tool } = listedTool(served);
    const serverTool: McpServerTool = {
      name: served.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      run: (args, context) => runAgentTool(served, options, context, args),
    };
    return { serverTool, products: toolProducts(served) };
  });
  const all = listed.map(({ serverTool }) => serverTool);
  return {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    instructions: [SHARED_MCP_INSTRUCTIONS, BOARD_MCP_INSTRUCTIONS, DESIGN_MCP_INSTRUCTIONS].join(
      "\n",
    ),
    tools: all,
    ...(listFor
      ? {
          toolsFor: (context) => {
            const list = listFor(context);
            if (list === "all") return all;
            return listed
              .filter(({ products }) => listsTool(products, list))
              .map(({ serverTool }) => serverTool);
          },
        }
      : {}),
    ...(notesFor ? { notesFor } : {}),
  };
}
