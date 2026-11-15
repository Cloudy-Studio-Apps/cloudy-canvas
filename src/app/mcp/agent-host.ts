import { createId, type FileType } from "@shared/core";
import {
  asUndoStep,
  type AgentFileCandidates,
  type AgentFileOpened,
  type AgentFileRef,
  type CanvasDocument,
  type TabSource,
  type FilesAgentHost,
} from "@canvas";
import type { OpenBoard } from "@board";
import { boardFiles } from "@board/ui";
import type { OpenDesign } from "@design";
import { designFiles } from "@design/ui";
import { fontLibrary, readLocalFile, storage, writeExportFile } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { withWorkspace } from "./agent-call-host";
import { openInAgentTab } from "./agent-open-tab";
import { agentPlugins } from "./agent-plugins";
import type { AgentCallHost } from "./agent-server-definition.types";
import type { AgentTabs } from "./agent-tab-binding.types";
import { sessionTab } from "./session-tab";
import { findFilesByName, searchedPlaces } from "./tabs/agent-file-lookup";
import { resolveNewFile } from "./tabs/agent-new-file";
import { tabsHostFor } from "./tabs/tabs-host";
import { variantsHostFor } from "./variants/variants-host";

/**
 * What agent tools reach outside the engine, for one collaborator: the board or design of its
 * tab (in its own workspace, see `withWorkspace`), recent files, opening files in background
 * tabs, plugins, reading and writing files and the fonts.
 */
export function agentHostFor(collaboratorId: string, tabs: AgentTabs): AgentCallHost {
  const board = (file: OpenBoard) => withWorkspace(file, collaboratorId);
  const design = (file: OpenDesign) => withWorkspace(file, collaboratorId);
  const openInTab = (source: TabSource) => openInAgentTab(tabs, collaboratorId, source);
  /**
   * Names a new file: its document's title, written through the agent's workspace as one undo
   * step (like `file_info_set`), so it's the agent's step, not the user's. The editor is ready
   * by now (`openInAgentTab` waited); if its file isn't there the call fails rather than drop it.
   */
  const titled = <F extends { engine: { doc: CanvasDocument } }>(file: F, title?: string): F => {
    if (title) asUndoStep(file.engine.doc, () => file.engine.doc.setMeta({ title }));
    return file;
  };
  const opened = <F>(file: F | null): F => {
    if (!file) throw new Error("The file opened in another kind of tab.");
    return file;
  };
  const showBoard = async (source: TabSource, title?: string) =>
    titled(board(opened(boardFiles.get(await openInTab(source)))), title);
  const showDesign = async (source: TabSource, title?: string) =>
    titled(design(opened(designFiles.get(await openInTab(source)))), title);
  /** The storage id and type of what `ref` names, or the candidates when several files match. */
  const resolve = async (
    type: FileType | undefined,
    ref: AgentFileRef,
  ): Promise<{ id: string; type: FileType } | AgentFileCandidates> => {
    if ("id" in ref) {
      const found = await checkOpenable(ref.id, type);
      return { id: ref.id, type: found };
    }
    const types: FileType[] = type ? [type] : ["board", "design"];
    const hits = (await Promise.all(types.map((each) => findFilesByName(each, ref.name)))).flat();
    const [only, ...others] = hits;
    if (!only) {
      throw new Error(`No ${type ?? "file"} named "${ref.name}" in ${await searchedPlaces()}.`);
    }
    if (others.length > 0) return { candidates: hits.map((hit) => hit.match) };
    const id = only.id ?? (await useRecentFilesStore.getState().open(only.match.path)).id;
    await checkOpenable(id, only.match.type);
    return { id, type: only.match.type };
  };
  /** Shows a file in its own tab (`openInTab`) and names it as its tab is. */
  const show = async (
    type: FileType,
    source: TabSource,
    title?: string,
  ): Promise<AgentFileOpened> => {
    const file =
      type === "board" ? await showBoard(source, title) : await showDesign(source, title);
    const meta = file.engine.doc.meta();
    return {
      type,
      id: file.id,
      name: meta.title || file.name,
      title: meta.title,
      description: meta.description,
      path: file.path,
    };
  };
  const openFile: FilesAgentHost["openFile"] = async (type, ref) => {
    const found = await resolve(type, ref);
    return "candidates" in found ? found : show(found.type, { type: found.type, fileId: found.id });
  };
  const newFile: FilesAgentHost["newFile"] = async (type, options) => {
    const where = await resolveNewFile(options);
    if ("matchingProjects" in where) return where;
    return show(type, { type, fileId: createId(), params: where.params }, options.name);
  };
  /** The session's tab's file of one product (binding it, see `sessionTab`). */
  const fileOf = <F>(files: { get(tabId: string): F | null }): F | null => {
    const tabId = sessionTab(tabs, collaboratorId);
    return tabId === null ? null : files.get(tabId);
  };
  return {
    board: () => mapOpen(fileOf(boardFiles), board),
    design: () => mapOpen(fileOf(designFiles), design),
    recentFiles: async (type) => {
      const files = (await storage.list()).filter((file) => !type || file.type === type);
      const found = await Promise.all(files.map((file) => storage.exists(file.id)));
      return files.map((file, i) => ({ ...file, missing: !found[i] }));
    },
    openFile,
    newFile,
    ...tabsHostFor(collaboratorId, tabs),
    ...variantsHostFor(collaboratorId, tabs, Date.now()),
    plugins: agentPlugins,
    writeFile: writeExportFile,
    readFile: readLocalFile,
    fontFamilies: () => fontLibrary.families(),
  };
}

function mapOpen<F, T>(file: F | null, map: (file: F) => T): T | null {
  return file ? map(file) : null;
}

/** The type of the recent file with that id (which must be `type` when given), if it can open. */
async function checkOpenable(id: string, type: FileType | undefined): Promise<FileType> {
  const file = await storage.get(id);
  if (!file || (type && file.type !== type)) throw new Error(`No ${type ?? "file"} with id ${id}.`);
  if (!(await storage.exists(id))) {
    throw new Error(
      `The ${file.type} "${file.name}" was moved or deleted (it was at ${file.path}).`,
    );
  }
  return file.type;
}
