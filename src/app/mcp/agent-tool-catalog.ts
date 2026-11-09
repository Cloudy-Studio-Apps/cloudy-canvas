import type { CollectedMcpTool } from "@canvas";
import type { AgentToolInfo, AgentToolSection } from "@shared/agent-server";
import { agentPlugins } from "./agent-plugins";
import type { ProductTool } from "./agent-tool-dispatch.types";
import { toolProducts } from "./agent-tool-dispatch";
import { agentTools } from "./agent-tools";
import { listedTool } from "./merge-product-tools";

/**
 * The tools agents see, as the agent menu lists them. Each tool is in exactly one section: the
 * shared ones and those that need no file first, then the board's, then the design's, then one
 * section per plugin with the tools its modules add (taken out of the others).
 */
export function agentToolCatalog(): AgentToolSection[] {
  const { served } = agentTools();
  const plugins = agentPlugins().filter((plugin) => plugin.tools.length > 0);
  const inPlugin = new Set(plugins.flatMap((plugin) => plugin.tools));
  const rest = served.filter((tool) => !inPlugin.has(tool.name));
  const only = (product: "board" | "design") =>
    rest.filter((tool) => {
      const products = toolProducts(tool);
      return products.length === 1 && products[0] === product;
    });
  const shared = rest.filter((tool) => toolProducts(tool).length !== 1);
  const infos = (tools: readonly ProductTool[]) => tools.map((tool) => info(listedTool(tool)));
  const byName = new Map(served.map((tool) => [tool.name, tool]));

  const sections: AgentToolSection[] = [
    { id: "shared", tools: infos(shared) },
    { id: "board", tools: infos(only("board")) },
    { id: "design", tools: infos(only("design")) },
    ...plugins.map((plugin) => ({
      id: `plugin:${plugin.id}`,
      title: plugin.name,
      tools: infos(plugin.tools.flatMap((name) => byName.get(name) ?? [])),
    })),
  ];
  return sections.filter((section) => section.tools.length > 0);
}

function info({ name, tool }: CollectedMcpTool<unknown>): AgentToolInfo {
  return { name, description: tool.description };
}
