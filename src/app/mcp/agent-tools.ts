import { builtInPrefixes } from "@canvas";
import { boardMcpTools, createBoardMcpTools } from "@board";
import { getBoardModules, getBoardProduct } from "@board/ui";
import { createDesignMcpTools, designMcpTools } from "@design";
import { getDesignModules, getDesignProduct } from "@design/ui";
import { usePluginsStore } from "@shared/stores/plugins-store";
import type { AgentTools } from "./agent-tools.types";
import { appTools, APP_PREFIXES } from "./app-tools";
import { mergeProductTools } from "./merge-product-tools";

/**
 * The agent tools, named with their owner's prefix: each product's, and what the server lists
 * (`mergeProductTools`: the tab tools and other app tools, and one tool per name, a shared one
 * once for both products). A plugin's module is found through the plugins'
 * statuses; a plugin id may not be any built-in prefix of either product nor an app topic (`tabs`, `file`, `plugins`). The server,
 * `plugins_list` and the agent menu all read this.
 */
export function agentTools(): AgentTools {
  const pluginOf = pluginOfModules();
  const boardModules = getBoardModules();
  const designModules = getDesignModules();
  const reserved = new Set([
    ...APP_PREFIXES,
    ...builtInPrefixes(boardModules, boardMcpTools),
    ...builtInPrefixes(designModules, designMcpTools),
  ]);
  const board = createBoardMcpTools(boardModules, getBoardProduct().kinds, pluginOf, reserved);
  const design = createDesignMcpTools(designModules, getDesignProduct().kinds, pluginOf, reserved);
  const refused = [...board.refused, ...design.refused];
  const served = mergeProductTools(board.tools, design.tools, appTools(), refused);
  return { board, design, served, refused };
}

/** Module id → the id of the plugin that registered it. */
function pluginOfModules(): (moduleId: string) => string | undefined {
  const owners = new Map<string, string>();
  for (const status of Object.values(usePluginsStore.getState().statuses)) {
    for (const moduleId of status.modules) owners.set(moduleId, status.id);
  }
  return (moduleId) => owners.get(moduleId);
}
