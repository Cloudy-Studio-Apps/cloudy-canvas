import type { CollectedMcpTools } from "@canvas";
import type { AgentPlugin } from "@board";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { agentTools } from "./agent-tools";

/**
 * The installed plugins for `list_plugins`, with the agent tools their modules add and those that
 * were refused (and why).
 */
export function agentPlugins(): AgentPlugin[] {
  const { installed, statuses } = usePluginsStore.getState();
  const { board, design } = agentTools();

  return installed.map(({ manifest }) => {
    const status = statuses[manifest.id];
    const refused = [...board.refused, ...design.refused]
      .filter((tool) => tool.pluginId === manifest.id)
      .map(({ name, reason }) => ({ name, reason }));
    return {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      ...(manifest.description ? { description: manifest.description } : {}),
      state: status?.state ?? "disabled",
      ...(status?.error ? { error: status.error } : {}),
      tools: [...toolNames(board, manifest.id), ...toolNames(design, manifest.id)],
      ...(refused.length > 0 ? { refusedTools: refused } : {}),
    };
  });
}

/** The full names of a plugin's tools in one product. */
function toolNames(collected: CollectedMcpTools<unknown>, pluginId: string): string[] {
  return collected.tools.filter((tool) => tool.pluginId === pluginId).map((tool) => tool.name);
}
