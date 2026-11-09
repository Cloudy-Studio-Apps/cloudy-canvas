import { builtInPrefixes } from "@canvas";
import { boardMcpTools, createBoardMcpTools } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { createDesignMcpTools, designMcpTools } from "@design";
import { getDesignModules, getDesignProduct } from "@design/ui";
import { usePluginsStore } from "@shared/stores/plugins-store";
import type { AgentTools } from "./agent-tools.types";

/**
 * Both products' agent tools, named with their owner's prefix. A plugin's module is found through
 * the plugins' statuses; a plugin id may not be any built-in prefix of either product.
 */
export function agentTools(): AgentTools {
  const pluginOf = pluginOfModules();
  const boardModules = getBoardModules();
  const designModules = getDesignModules();
  const reserved = new Set([
    ...builtInPrefixes(boardModules, boardMcpTools),
    ...builtInPrefixes(designModules, designMcpTools),
  ]);
  return {
    board: createBoardMcpTools(boardModules, getBoardProduct().kinds, pluginOf, reserved),
    design: createDesignMcpTools(designModules, getDesignProduct().kinds, pluginOf, reserved),
  };
}

/** Module id → the id of the plugin that registered it. */
function pluginOfModules(): (moduleId: string) => string | undefined {
  const owners = new Map<string, string>();
  for (const status of Object.values(usePluginsStore.getState().statuses)) {
    for (const moduleId of status.modules) owners.set(moduleId, status.id);
  }
  return (moduleId) => owners.get(moduleId);
}
