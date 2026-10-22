import { collectAgentTools, type ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { BoardToolOptions } from "../board-options.types";
import { boardAgentTools } from "../board-points";
import type { BoardAgentTool, BoardAgentToolGroup } from "./board-agent.types";

/**
 * Every tool agents can call on boards: the groups the board's modules contribute to
 * `boardAgentTools`, in module order. A tool whose name is in `taken` or an earlier one took is
 * left out and passed to `onSkipped`.
 */
export function createAgentTools(
  modules: ModuleHost,
  kinds: ElementKinds<BoardToolOptions>,
  onSkipped?: (tool: BoardAgentTool, group: BoardAgentToolGroup) => void,
  taken?: Set<string>,
): BoardAgentTool[] {
  return collectAgentTools(modules.get(boardAgentTools), { kinds }, onSkipped, taken);
}
