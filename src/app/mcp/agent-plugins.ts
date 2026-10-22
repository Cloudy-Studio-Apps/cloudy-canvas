import type { AgentToolGroup } from "@canvas";
import type { ExtensionPoint, ModuleHost } from "@shared/core";
import { boardAgentTools, type AgentPlugin } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { designAgentTools } from "@design";
import { getDesignModules, getDesignProduct } from "@design/ui";
import { usePluginsStore } from "@shared/stores/plugins-store";

/** The installed plugins for `list_plugins`, with the agent tools their modules add. */
export function agentPlugins(): AgentPlugin[] {
  const { installed, statuses } = usePluginsStore.getState();
  const board = toolNames(getBoardModules(), boardAgentTools, { kinds: getBoardProduct().kinds });
  const design = toolNames(getDesignModules(), designAgentTools, {
    kinds: getDesignProduct().kinds,
  });

  return installed.map(({ manifest }) => {
    const status = statuses[manifest.id];
    const owned = new Set(status?.modules ?? []);
    return {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      ...(manifest.description ? { description: manifest.description } : {}),
      state: status?.state ?? "disabled",
      ...(status?.error ? { error: status.error } : {}),
      tools: [...board(owned), ...design(owned)],
    };
  });
}

/** The names of the tools the groups of the given modules add to a product. */
function toolNames<H, C>(
  modules: ModuleHost,
  point: ExtensionPoint<AgentToolGroup<H, C>>,
  context: C,
): (owned: ReadonlySet<string>) => string[] {
  const groups = modules.get(point);
  return (owned) =>
    groups
      .filter((group) => owned.has(modules.ownerOf(point, group.id) ?? ""))
      .flatMap((group) => group.tools(context).map((tool) => tool.name));
}
