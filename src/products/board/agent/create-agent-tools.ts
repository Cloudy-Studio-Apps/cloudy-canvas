import type { ElementKinds } from "@canvas";
import type { ModuleHost } from "@shared/core";

import type { BoardToolOptions } from "../board-options.types";
import { boardAgentTools } from "../board-points";
import type { BoardAgentTool } from "./board-agent.types";

/** Every tool agents can call: the groups the board's modules contribute to `boardAgentTools`. */
export function createAgentTools(
  modules: ModuleHost,
  kinds: ElementKinds<BoardToolOptions>,
): BoardAgentTool[] {
  return modules.get(boardAgentTools).flatMap((group) => group.tools({ kinds }));
}
