import { createId } from "@shared/core";
import type { AgentBoard, AgentHost } from "@board";
import { getActiveBoard, waitForActiveBoard } from "@board/ui";
import { storage } from "@platform";
import { router } from "../router";

/** What agent tools reach outside the engine: the open board, recent files and navigation. */
export const agentHost: AgentHost = {
  board: getActiveBoard,
  recentFiles: () => storage.list(),
  openBoard: async (id) => {
    const file = await storage.get(id);
    if (!file || file.type !== "board") throw new Error(`No board with id ${id}.`);
    return showBoard(id);
  },
  newBoard: () => showBoard(createId()),
};

function showBoard(id: string): Promise<AgentBoard> {
  if (getActiveBoard()?.id !== id) void router.navigate(`/board/${id}`);
  return waitForActiveBoard(id);
}
