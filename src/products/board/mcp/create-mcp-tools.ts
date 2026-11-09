import { collectMcpTools, mcpToolOwner, type CollectedMcpTools, type ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { BoardToolOptions } from "../board-options.types";
import { boardMcpTools } from "../board-points";
import type { AgentHost } from "./board-mcp.types";

/**
 * Every tool agents can call on boards: the groups the board's modules contribute to
 * `boardMcpTools`, in module order, named with their owner's prefix (`collectMcpTools`).
 * `pluginOf` tells which plugin a module belongs to; `reserved` holds the built-in prefixes a
 * plugin id may not take.
 */
export function createBoardMcpTools(
  modules: ModuleHost,
  kinds: ElementKinds<BoardToolOptions>,
  pluginOf: (moduleId: string) => string | undefined,
  reserved: ReadonlySet<string>,
): CollectedMcpTools<AgentHost> {
  return collectMcpTools(
    modules.get(boardMcpTools),
    { kinds },
    (group) => mcpToolOwner(modules, boardMcpTools, group.id, pluginOf),
    reserved,
  );
}
