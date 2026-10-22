import { createId } from "@shared/core";
import type { AgentBoard, AgentHost } from "@board";
import { getActiveBoard, waitForActiveBoard } from "@board/ui";
import type { AgentDesign, DesignAgentHost } from "@design";
import { getActiveDesign, waitForActiveDesign } from "@design/ui";
import { fontLibrary, readLocalFile, storage, writeExportFile } from "@platform";
import { router } from "../router";
import { agentPlugins } from "./agent-plugins";

/**
 * What agent tools reach outside the engine: the open board or design, recent files, opening
 * files, plugins, reading and writing files and the fonts.
 */
export const agentHost: AgentHost & DesignAgentHost = {
  board: getActiveBoard,
  design: getActiveDesign,
  recentFiles: async () => {
    const files = await storage.list();
    const found = await Promise.all(files.map((file) => storage.exists(file.id)));
    return files.map((file, i) => ({ ...file, missing: !found[i] }));
  },
  openBoard: async (id) => {
    await checkOpenable(id, "board");
    return showBoard(id);
  },
  newBoard: () => showBoard(createId()),
  openDesign: async (id) => {
    await checkOpenable(id, "design");
    return showDesign(id);
  },
  newDesign: () => showDesign(createId()),
  plugins: agentPlugins,
  writeFile: writeExportFile,
  readFile: readLocalFile,
  fontFamilies: () => fontLibrary.families(),
};

async function checkOpenable(id: string, type: "board" | "design"): Promise<void> {
  const file = await storage.get(id);
  if (!file || file.type !== type) throw new Error(`No ${type} with id ${id}.`);
  if (!(await storage.exists(id))) {
    throw new Error(`The ${type} "${file.name}" was moved or deleted (it was at ${file.path}).`);
  }
}

function showBoard(id: string): Promise<AgentBoard> {
  if (getActiveBoard()?.id !== id) void router.navigate(`/board/${id}`);
  return waitForActiveBoard(id);
}

function showDesign(id: string): Promise<AgentDesign> {
  if (getActiveDesign()?.id !== id) void router.navigate(`/design/${id}`);
  return waitForActiveDesign(id);
}
