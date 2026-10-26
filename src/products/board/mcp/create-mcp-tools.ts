import { collectMcpTools, type ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { BoardToolOptions } from "../board-options.types";
import { boardMcpTools } from "../board-points";
import type { BoardMcpTool, BoardMcpToolGroup } from "./board-mcp.types";

/**
 * Every tool agents can call on boards: the groups the board's modules contribute to
 * `boardMcpTools`, in module order. A tool whose name is in `taken` or an earlier one took is
 * left out and passed to `onSkipped`.
 */
export function createBoardMcpTools(
  modules: ModuleHost,
  kinds: ElementKinds<BoardToolOptions>,
  onSkipped?: (tool: BoardMcpTool, group: BoardMcpToolGroup) => void,
  taken?: Set<string>,
): BoardMcpTool[] {
  return collectMcpTools(modules.get(boardMcpTools), { kinds }, onSkipped, taken);
}
