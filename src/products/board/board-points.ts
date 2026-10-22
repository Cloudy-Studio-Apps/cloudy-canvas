import { createCanvasPoints } from "@canvas";
import { definePoint } from "@shared/core";

import type { BoardAgentToolGroup } from "./agent/board-agent.types";
import type { BoardToolOptions } from "./board-options.types";

/** The points the board's canvas is assembled from (see `composeProduct`). */
export const boardCanvas = createCanvasPoints<BoardToolOptions>("board");

/** Tools agents can call on the open board, one group per module (or per group file). */
export const boardAgentTools = definePoint<BoardAgentToolGroup>("board.agentTools", {
  keyOf: (group) => group.id,
});
