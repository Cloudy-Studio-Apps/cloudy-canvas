import { createId } from "@shared/core";
import type { AgentHost, OpenBoard } from "@board";
import { getActiveBoard, waitForActiveBoard } from "@board/ui";
import type { DesignAgentHost, OpenDesign } from "@design";
import { getActiveDesign, waitForActiveDesign } from "@design/ui";
import { fontLibrary, readLocalFile, storage, writeExportFile } from "@platform";
import { router } from "../router";
import { withWorkspace } from "./agent-call-host";
import { agentPlugins } from "./agent-plugins";

/** The board or design open in the window, with the user's engine (agents get workspaces of it). */
export function openFile(): OpenBoard | OpenDesign | null {
  return getActiveBoard() ?? getActiveDesign();
}

/**
 * What agent tools reach outside the engine, for one collaborator: the open board or design (in
 * its own workspace, see `withWorkspace`), recent files, opening files, plugins, reading and
 * writing files and the fonts.
 */
export function agentHostFor(collaboratorId: string): AgentHost & DesignAgentHost {
  const board = (file: OpenBoard) => withWorkspace(file, collaboratorId);
  const design = (file: OpenDesign) => withWorkspace(file, collaboratorId);
  return {
    board: () => mapOpen(getActiveBoard(), board),
    design: () => mapOpen(getActiveDesign(), design),
    recentFiles: async () => {
      const files = await storage.list();
      const found = await Promise.all(files.map((file) => storage.exists(file.id)));
      return files.map((file, i) => ({ ...file, missing: !found[i] }));
    },
    openBoard: async (id) => {
      await checkOpenable(id, "board");
      return board(await showBoard(id));
    },
    newBoard: async () => board(await showBoard(createId())),
    openDesign: async (id) => {
      await checkOpenable(id, "design");
      return design(await showDesign(id));
    },
    newDesign: async () => design(await showDesign(createId())),
    plugins: agentPlugins,
    writeFile: writeExportFile,
    readFile: readLocalFile,
    fontFamilies: () => fontLibrary.families(),
  };
}

function mapOpen<F, T>(file: F | null, map: (file: F) => T): T | null {
  return file ? map(file) : null;
}

async function checkOpenable(id: string, type: "board" | "design"): Promise<void> {
  const file = await storage.get(id);
  if (!file || file.type !== type) throw new Error(`No ${type} with id ${id}.`);
  if (!(await storage.exists(id))) {
    throw new Error(`The ${type} "${file.name}" was moved or deleted (it was at ${file.path}).`);
  }
}

function showBoard(id: string): Promise<OpenBoard> {
  if (getActiveBoard()?.id !== id) void router.navigate(`/board/${id}`);
  return waitForActiveBoard(id);
}

function showDesign(id: string): Promise<OpenDesign> {
  if (getActiveDesign()?.id !== id) void router.navigate(`/design/${id}`);
  return waitForActiveDesign(id);
}
