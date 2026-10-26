import { createCanvasPoints } from "@canvas";
import { definePoint } from "@shared/core";

import type { BoardMcpToolGroup } from "./mcp/board-mcp.types";
import type { BoardToolOptions } from "./board-options.types";
import type { BoardMigration } from "./file/board-migration.types";

/** The points the board's canvas is assembled from (see `composeProduct`). */
export const boardCanvas = createCanvasPoints<BoardToolOptions>("board");

/** Tools agents can call on the open board, one group per module (or per group file). */
export const boardMcpTools = definePoint<BoardMcpToolGroup>("board.mcpTools", {
  keyOf: (group) => group.id,
});

/** What brings an older board file up to date when it opens, run in module order. */
export const boardMigrations = definePoint<BoardMigration>("board.migrations", {
  keyOf: (migration) => migration.id,
});
