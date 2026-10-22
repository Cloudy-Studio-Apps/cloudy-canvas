import type { ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { BoardToolOptions } from "../board-options.types";
import { boardAgentTools } from "../board-points";
import type { BoardAgentTool, BoardAgentToolGroup } from "./board-agent.types";

/**
 * Every tool agents can call: the groups the board's modules contribute to `boardAgentTools`, in
 * module order. A tool whose name an earlier one took is left out and passed to `onSkipped`.
 */
export function createAgentTools(
  modules: ModuleHost,
  kinds: ElementKinds<BoardToolOptions>,
  onSkipped?: (tool: BoardAgentTool, group: BoardAgentToolGroup) => void,
): BoardAgentTool[] {
  const names = new Set<string>();
  return modules.get(boardAgentTools).flatMap((group) =>
    group.tools({ kinds }).filter((tool) => {
      if (names.has(tool.name)) {
        onSkipped?.(tool, group);
        return false;
      }
      names.add(tool.name);
      return true;
    }),
  );
}
