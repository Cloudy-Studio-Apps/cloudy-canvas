import type { OpenBoard } from "@board";
import { createAgentFiles } from "@canvas-ui";

/** Each tab's board, for agents (see `app/mcp`, which binds each one to a tab). */
export const boardFiles = createAgentFiles<OpenBoard>("board");

/** The board of the tab on screen, or `null`. */
export const getActiveBoard = (): OpenBoard | null => boardFiles.active();
