import type { EditorModeDefinition } from "@canvas-ui";
import type { BoardToolOptions } from "@board";

/** A board mode in one object (the board has no rail or mode sidebar). */
export type BoardModeDefinition = EditorModeDefinition<BoardToolOptions>;
