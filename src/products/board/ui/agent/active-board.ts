import type { OpenBoard } from "@board";
import { createActiveFile } from "@canvas-ui";

/** The board open in the window, for agents (see `app/mcp`, which gives each one a workspace). */
export const activeBoard = createActiveFile<OpenBoard>("board");

export const getActiveBoard = (): OpenBoard | null => activeBoard.get();
export const setActiveBoard = (board: OpenBoard | null): void => activeBoard.set(board);
/** Resolves once board `id` is open and ready; rejects if it isn't within the timeout. */
export const waitForActiveBoard = (id: string): Promise<OpenBoard> => activeBoard.waitFor(id);
