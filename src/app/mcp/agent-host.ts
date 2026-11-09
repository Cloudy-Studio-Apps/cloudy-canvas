import { createId, type FileType } from "@shared/core";
import type { AgentHost, OpenBoard } from "@board";
import { boardFiles } from "@board/ui";
import type { DesignAgentHost, OpenDesign } from "@design";
import { designFiles } from "@design/ui";
import { fontLibrary, readLocalFile, storage, writeExportFile } from "@platform";
import { fileTabs } from "../tabs/file-tabs-instance";
import { withWorkspace } from "./agent-call-host";
import { agentPlugins } from "./agent-plugins";
import type { AgentTabs } from "./agent-tab-binding.types";
import { prepareAgentCall, TAB_CLOSED, tabAgentFile } from "./agent-tab-files";

/**
 * What agent tools reach outside the engine, for one collaborator: the board or design of its
 * tab (in its own workspace, see `withWorkspace`), recent files, opening files in background
 * tabs, plugins, reading and writing files and the fonts.
 */
export function agentHostFor(collaboratorId: string, tabs: AgentTabs): AgentHost & DesignAgentHost {
  const board = (file: OpenBoard) => withWorkspace(file, collaboratorId);
  const design = (file: OpenDesign) => withWorkspace(file, collaboratorId);
  /**
   * Opens the file in a background tab (never shown), moves the session there and waits for its
   * editor; resolves with the tab's id.
   */
  const openInTab = async (type: FileType, fileId: string): Promise<string> => {
    const tab = fileTabs.open({ type, fileId }, { activate: false });
    tabs.bind(collaboratorId, tab.id);
    const end = await prepareAgentCall(tabs, collaboratorId);
    end();
    return tab.id;
  };
  const opened = <F>(file: F | null): F => {
    if (!file) throw new Error("The file opened in another kind of tab.");
    return file;
  };
  const showBoard = async (id: string) =>
    board(opened(boardFiles.get(await openInTab("board", id))));
  const showDesign = async (id: string) =>
    design(opened(designFiles.get(await openInTab("design", id))));
  /** The session's tab's file of one product (binding it, see `sessionTab`). */
  const fileOf = <F>(files: { get(tabId: string): F | null }): F | null => {
    const tabId = sessionTab(tabs, collaboratorId);
    return tabId === null ? null : files.get(tabId);
  };
  return {
    board: () => mapOpen(fileOf(boardFiles), board),
    design: () => mapOpen(fileOf(designFiles), design),
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
}

/**
 * The tab the session works in. Unbound, it binds to the active tab when that has a file (else
 * `null`: Home). Bound to a tab closed since, it's unbound and this throws, once.
 */
function sessionTab(tabs: AgentTabs, session: string): string | null {
  const bound = tabs.tabFor(session);
  if (bound !== null) {
    if (fileTabs.get(bound)) return bound;
    tabs.unbind(session);
    throw new Error(TAB_CLOSED);
  }
  const { activeId } = fileTabs.store.get();
  if (activeId === null || !tabAgentFile(activeId)) return null;
  tabs.bind(session, activeId);
  fileTabs.noteAgentCall(activeId);
  return activeId;
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
