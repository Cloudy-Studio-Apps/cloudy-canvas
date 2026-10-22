import { boardAgentTools, type AgentPlugin } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { usePluginsStore } from "@shared/stores/plugins-store";

/** The installed plugins for `list_plugins`, with the agent tools their modules add. */
export function agentPlugins(): AgentPlugin[] {
  const { installed, statuses } = usePluginsStore.getState();
  const modules = getBoardModules();
  const { kinds } = getBoardProduct();
  const groups = modules.get(boardAgentTools);

  return installed.map(({ manifest }) => {
    const status = statuses[manifest.id];
    const owned = new Set(status?.modules ?? []);
    const tools = groups
      .filter((group) => owned.has(modules.ownerOf(boardAgentTools, group.id) ?? ""))
      .flatMap((group) => group.tools({ kinds }).map((tool) => tool.name));
    return {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      ...(manifest.description ? { description: manifest.description } : {}),
      state: status?.state ?? "disabled",
      ...(status?.error ? { error: status.error } : {}),
      tools,
    };
  });
}
