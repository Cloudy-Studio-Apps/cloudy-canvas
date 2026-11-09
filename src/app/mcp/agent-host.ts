import { createId, type FileType } from "@shared/core";
import type { AgentFileRef, AgentNewFile, TabSource, TabsAgentHost } from "@canvas";
import type { AgentHost, OpenBoard } from "@board";
import { boardFiles } from "@board/ui";
import type { DesignAgentHost, OpenDesign } from "@design";
import { designFiles } from "@design/ui";
import { fontLibrary, readLocalFile, storage, writeExportFile } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { fileTabs } from "../tabs/file-tabs-instance";
import { withWorkspace } from "./agent-call-host";
import { openInAgentTab } from "./agent-open-tab";
import { agentPlugins } from "./agent-plugins";
import type { AgentTabs } from "./agent-tab-binding.types";
import { TAB_CLOSED, tabAgentFile } from "./agent-tab-files";
import { findFilesByName, searchedPlaces } from "./tabs/agent-file-lookup";
import { resolveNewFile } from "./tabs/agent-new-file";
import { tabsHostFor } from "./tabs/tabs-host";

/**
 * What agent tools reach outside the engine, for one collaborator: the board or design of its
 * tab (in its own workspace, see `withWorkspace`), recent files, opening files in background
 * tabs, plugins, reading and writing files and the fonts.
 */
export function agentHostFor(
  collaboratorId: string,
  tabs: AgentTabs,
): AgentHost & DesignAgentHost & TabsAgentHost {
  const board = (file: OpenBoard) => withWorkspace(file, collaboratorId);
  const design = (file: OpenDesign) => withWorkspace(file, collaboratorId);
  const openInTab = (source: TabSource) => openInAgentTab(tabs, collaboratorId, source);
  const opened = <F>(file: F | null): F => {
    if (!file) throw new Error("The file opened in another kind of tab.");
    return file;
  };
  const showBoard = async (source: TabSource) =>
    board(opened(boardFiles.get(await openInTab(source))));
  const showDesign = async (source: TabSource) =>
    design(opened(designFiles.get(await openInTab(source))));
  /** The storage id of what `ref` names, or the candidates when several files have the name. */
  const resolve = async (type: FileType, ref: AgentFileRef) => {
    if ("id" in ref) {
      await checkOpenable(ref.id, type);
      return { id: ref.id };
    }
    const hits = await findFilesByName(type, ref.name);
    const [only, ...others] = hits;
    if (!only) {
      throw new Error(`No ${type} named "${ref.name}" in ${await searchedPlaces()}.`);
    }
    if (others.length > 0) return { candidates: hits.map((hit) => hit.match) };
    const id = only.id ?? (await useRecentFilesStore.getState().open(only.match.path)).id;
    await checkOpenable(id, type);
    return { id };
  };
  const openFile = async <F>(
    type: FileType,
    ref: AgentFileRef,
    show: (source: TabSource) => Promise<F>,
  ) => {
    const found = await resolve(type, ref);
    return found.id === undefined ? found : show({ type, fileId: found.id });
  };
  const createFile = async <F>(
    type: FileType,
    options: AgentNewFile,
    show: (source: TabSource) => Promise<F>,
  ) => {
    const where = await resolveNewFile(options);
    if ("matchingProjects" in where) return where;
    return show({
      type,
      fileId: createId(),
      params: where.params,
      ...(options.name && { name: options.name }),
    });
  };
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
    openBoard: (ref) => openFile("board", ref, showBoard),
    newBoard: (options) => createFile("board", options, showBoard),
    openDesign: (ref) => openFile("design", ref, showDesign),
    newDesign: (options) => createFile("design", options, showDesign),
    ...tabsHostFor(collaboratorId, tabs),
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
