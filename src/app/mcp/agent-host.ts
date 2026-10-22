import { createId } from "@shared/core";
import type { AgentBoard, AgentHost } from "@board";
import { getActiveBoard, waitForActiveBoard } from "@board/ui";
import { storage, writeExportFile } from "@platform";
import { router } from "../router";
import { agentPlugins } from "./agent-plugins";

/** What agent tools reach outside the engine: the open board, recent files and navigation. */
export const agentHost: AgentHost = {
  board: getActiveBoard,
  recentFiles: async () => {
    const files = await storage.list();
    const found = await Promise.all(files.map((file) => storage.exists(file.id)));
    return files.map((file, i) => ({ ...file, missing: !found[i] }));
  },
  openBoard: async (id) => {
    const file = await storage.get(id);
    if (!file || file.type !== "board") throw new Error(`No board with id ${id}.`);
    if (!(await storage.exists(id))) {
      throw new Error(`The board "${file.name}" was moved or deleted (it was at ${file.path}).`);
    }
    return showBoard(id);
  },
  newBoard: () => showBoard(createId()),
  plugins: agentPlugins,
  writeFile: writeExportFile,
};

function showBoard(id: string): Promise<AgentBoard> {
  if (getActiveBoard()?.id !== id) void router.navigate(`/board/${id}`);
  return waitForActiveBoard(id);
}
