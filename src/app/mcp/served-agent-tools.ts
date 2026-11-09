import type { CollectedMcpTool, RefusedMcpTool } from "@canvas";
import type { AgentCallHost } from "./agent-server-definition.types";

/**
 * The tools the server lists, with distinct names across the products and the tab tools: a
 * built-in name served twice throws, naming both modules; a plugin's tool with a taken name is
 * left out and added to `refused`.
 */
export function servedAgentTools(
  tools: readonly CollectedMcpTool<AgentCallHost>[],
  refused: RefusedMcpTool[],
): CollectedMcpTool<AgentCallHost>[] {
  const owners = new Map<string, string>();
  return tools.filter(({ name, moduleId, pluginId }) => {
    const other = owners.get(name);
    if (other === undefined) {
      owners.set(name, moduleId);
      return true;
    }
    const reason = `"${name}" is the name of a tool of the module "${other}".`;
    if (pluginId === undefined) {
      throw new Error(`The module "${moduleId}" adds an MCP tool that can't be served: ${reason}`);
    }
    refused.push({ name, pluginId, reason });
    return false;
  });
}
