import type { AgentBoard } from "@board";
import { createActiveFile } from "@canvas-ui";

/** The board open in the window, for agents (see `app/mcp`). */
export const activeBoard = createActiveFile<AgentBoard>("board");

export const getActiveBoard = (): AgentBoard | null => activeBoard.get();
export const setActiveBoard = (board: AgentBoard | null): void => activeBoard.set(board);
/** Resolves once board `id` is open and ready; rejects if it isn't within the timeout. */
export const waitForActiveBoard = (id: string): Promise<AgentBoard> => activeBoard.waitFor(id);
