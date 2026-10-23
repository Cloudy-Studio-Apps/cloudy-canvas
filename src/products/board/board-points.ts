import { createCanvasPoints } from "@canvas";
import { definePoint } from "@shared/core";

import type { BoardAgentToolGroup } from "./agent/board-agent.types";
import type { BoardToolOptions } from "./board-options.types";
import type { BoardMigration } from "./file/board-migration.types";
import type { ErStandardDefinition } from "./modules/er/base/standards";

/** The points the board's canvas is assembled from (see `composeProduct`). */
export const boardCanvas = createCanvasPoints<BoardToolOptions>("board");

/** Tools agents can call on the open board, one group per module (or per group file). */
export const boardAgentTools = definePoint<BoardAgentToolGroup>("board.agentTools", {
  keyOf: (group) => group.id,
});

/**
 * The standards ER diagrams can follow (textbooks or papers, `defineErStandard`), keyed by id: the
 * er module's built-ins and plugins'. Read through `erStandards`.
 */
export const boardErStandards = definePoint<ErStandardDefinition>("board.erStandards", {
  keyOf: (standard) => standard.id,
});

/** What brings an older board file up to date when it opens, run in module order. */
export const boardMigrations = definePoint<BoardMigration>("board.migrations", {
  keyOf: (migration) => migration.id,
});
