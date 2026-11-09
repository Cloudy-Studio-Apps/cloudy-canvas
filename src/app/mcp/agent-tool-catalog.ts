import type { CollectedMcpTool } from "@canvas";
import type { AgentToolInfo, AgentToolSection } from "@shared/agent-server";
import { agentPlugins } from "./agent-plugins";
import { agentTools } from "./agent-tools";

/**
 * The tools agents see, as the agent menu lists them: the board's, the design's and one section
 * per plugin with the tools its modules add.
 */
export function agentToolCatalog(): AgentToolSection[] {
  const { board, design } = agentTools();
  const plugins = agentPlugins().filter((plugin) => plugin.tools.length > 0);
  const all = new Map([...board.tools, ...design.tools].map((tool) => [tool.name, info(tool)]));
  const own = (tools: readonly CollectedMcpTool<unknown>[]) =>
    tools.filter((tool) => tool.pluginId === undefined).map(info);

  const sections: AgentToolSection[] = [
    { id: "board", title: "Board", tools: own(board.tools) },
    { id: "design", title: "Design", tools: own(design.tools) },
    ...plugins.map((plugin) => ({
      id: `plugin:${plugin.id}`,
      title: plugin.name,
      tools: plugin.tools.flatMap((name) => all.get(name) ?? []),
    })),
  ];
  return sections.filter((section) => section.tools.length > 0);
}

function info({ name, tool }: CollectedMcpTool<unknown>): AgentToolInfo {
  return { name, description: tool.description };
}
