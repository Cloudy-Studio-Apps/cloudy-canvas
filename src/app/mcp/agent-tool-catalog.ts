import type { AgentToolInfo, AgentToolSection } from "@shared/agent-server";
import { createAgentTools } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { createDesignAgentTools } from "@design";
import { getDesignModules, getDesignProduct } from "@design/ui";
import { agentPlugins } from "./agent-plugins";

/**
 * The tools agents see, as the agent menu lists them: the board's, the design's and one section
 * per plugin with the tools its modules add.
 */
export function agentToolCatalog(): AgentToolSection[] {
  // The same names as the server's, which leaves out a tool whose name is taken.
  const taken = new Set<string>();
  const board = createAgentTools(getBoardModules(), getBoardProduct().kinds, undefined, taken);
  const design = createDesignAgentTools(
    getDesignModules(),
    getDesignProduct().kinds,
    undefined,
    taken,
  );
  const plugins = agentPlugins().filter((plugin) => plugin.tools.length > 0);
  const byPlugin = new Set(plugins.flatMap((plugin) => plugin.tools));
  const all = new Map([...board, ...design].map((tool) => [tool.name, info(tool)]));
  const own = (tools: readonly AgentToolInfo[]) =>
    tools.filter((tool) => !byPlugin.has(tool.name)).map(info);

  const sections: AgentToolSection[] = [
    { id: "board", title: "Board", tools: own(board) },
    { id: "design", title: "Design", tools: own(design) },
    ...plugins.map((plugin) => ({
      id: `plugin:${plugin.id}`,
      title: plugin.name,
      tools: plugin.tools.flatMap((name) => all.get(name) ?? []),
    })),
  ];
  return sections.filter((section) => section.tools.length > 0);
}

function info({ name, description }: AgentToolInfo): AgentToolInfo {
  return { name, description };
}
