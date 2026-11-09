import type { FileInfo, FileType } from "@shared/core";
import type { CanvasDocument } from "../document";
import type { ShareGuest } from "../share";

/**
 * What a tab holds in memory (see the README): `hibernated` only its id and name, `document` its
 * document, `headless` an engine too (no drawing), `active` the one on screen.
 */
export type TabState = "hibernated" | "document" | "headless" | "active";

/** Whether a tab's document is in memory. */
export type TabLoad =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; document: CanvasDocument; info: FileInfo | null }
  | { status: "error"; message: string };

/** One open file. */
export interface FileTab {
  /** From `createId()`. */
  readonly id: string;
  readonly type: FileType;
  /** The storage id, or `live:<fileId>` for a joined live session. */
  readonly fileId: string;
  readonly name: string;
  /** The route's search params at open (dir, project, libraries, starter, mode). */
  readonly params: Readonly<Record<string, string>>;
  readonly live: ShareGuest | null;
  readonly state: TabState;
  readonly load: TabLoad;
  /** Changes nothing will save, or an autosave pending. */
  readonly unsaved: boolean;
  /** This tab shares a live session. */
  readonly hosting: boolean;
  /** The agent sessions bound to it. */
  readonly agents: readonly string[];
  readonly lastActiveAt: number;
  readonly lastAgentCallAt: number | null;
  /** Agent calls running in it now (`beginAgentCall`): while any runs, it keeps its engine. */
  readonly agentCalls: number;
}

export interface FileTabsSnapshot {
  readonly tabs: readonly FileTab[];
  /** `null`: Home. */
  readonly activeId: string | null;
}

/** What to open in a tab. */
export interface TabSource {
  type: FileType;
  /** The storage id; for a live session the session's file id (the tab's is `live:<fileId>`). */
  fileId: string;
  params?: Record<string, string>;
  live?: ShareGuest;
  name?: string;
}

/** Reads a file's document: from storage, or from the live session when `live` is given. */
export interface TabLoader {
  load(
    fileId: string,
    live: ShareGuest | null,
  ): Promise<{ document: CanvasDocument; info: FileInfo | null }>;
}

export interface FileTabsOptions {
  loaders: Record<FileType, TabLoader>;
  /** At most this many file tabs (1 on Android: opening another file closes the open one). */
  maxFileTabs?: number;
  now?: () => number;
}

export interface OpenTabOptions {
  /** Default `true`. A tab opened in the background starts `hibernated`, not loading. */
  activate?: boolean;
}

/** The states a mounted tab's editor can be let go toward. */
export type LeaveTarget = Extract<TabState, "document" | "hibernated">;

/**
 * What the host does before the policy takes a background tab's editor away
 * (`FileTabs.setLeaveGuard`): the editor stays mounted until `prepare` resolves.
 */
export interface TabLeaveGuard {
  /**
   * Readies the tab's editor to go (its pending save, its preview, and before `hibernated` its
   * closing work). Resolves to `false` when it must keep its editor (changes nothing would save).
   */
  prepare(id: string, target: LeaveTarget): Promise<boolean>;
  /** Resolves once the tab's editor is gone and its last save took the document's data. */
  unmounted(id: string): Promise<void>;
}
