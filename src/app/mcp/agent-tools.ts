import { builtInPrefixes } from "@canvas";
import { boardMcpTools, createBoardMcpTools } from "@board";
import { boardModulePlugin, getBoardModules, getBoardProduct } from "@board/ui";
import { createDesignMcpTools, designMcpTools } from "@design";
import { designModulePlugin, getDesignModules, getDesignProduct } from "@design/ui";
import type { AgentTools } from "./agent-tools.types";
import { appTools, APP_PREFIXES } from "./app-tools";
import { mergeProductTools } from "./merge-product-tools";

/**
 * The agent tools, named with their owner's prefix: each product's, and what the server lists
 * (`mergeProductTools`: the tab tools and other app tools, and one tool per name, a shared one
 * once for both products). A plugin's module is found through the products'
 * registration maps; a plugin id may not be any built-in prefix of either product nor an app topic (`tabs`, `file`, `plugins`). The server,
 * `plugins_list` and the agent menu all read this.
 */
export function agentTools(): AgentTools {
  const boardModules = getBoardModules();
  const designModules = getDesignModules();
  const reserved = new Set([
    ...APP_PREFIXES,
    ...builtInPrefixes(boardModules, boardMcpTools),
    ...builtInPrefixes(designModules, designMcpTools),
  ]);
  const board = createBoardMcpTools(
    boardModules,
    getBoardProduct().kinds,
    pluginOfModules,
    reserved,
  );
  const design = createDesignMcpTools(
    designModules,
    getDesignProduct().kinds,
    pluginOfModules,
    reserved,
  );
  const refused = [...board.refused, ...design.refused];
  const served = mergeProductTools(board.tools, design.tools, appTools(), refused);
  return { board, design, served, refused };
}

/**
 * Module id → the id of the plugin that registered it. Read from the registration-time maps, so a
 * plugin that failed (its status then lists no modules) still owns the modules left registered.
 */
function pluginOfModules(moduleId: string): string | undefined {
  return boardModulePlugin(moduleId) ?? designModulePlugin(moduleId);
}
