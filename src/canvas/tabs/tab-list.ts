import { createId } from "@shared/core";
import { clamp } from "../utils";
import type { FileTab, TabSource } from "./file-tabs.types";

/** The tab's `fileId`: a live session's is `live:<fileId>`, so it never matches the stored file. */
export function tabFileId(source: TabSource): string {
  return source.live ? `live:${source.fileId}` : source.fileId;
}

/** A new tab for `source`, hibernated until something loads it. */
export function createTab(source: TabSource, now: number): FileTab {
  return {
    id: createId(),
    type: source.type,
    fileId: tabFileId(source),
    name: source.name ?? "",
    params: { ...source.params },
    live: source.live ?? null,
    state: "hibernated",
    load: { status: "idle" },
    unsaved: false,
    hosting: false,
    agents: [],
    lastActiveAt: now,
    lastAgentCallAt: null,
  };
}

/** `tabs` with the tab `id` changed (the same array when it isn't there). */
export function patchTab(
  tabs: readonly FileTab[],
  id: string,
  patch: (tab: FileTab) => Partial<FileTab>,
): readonly FileTab[] {
  const index = tabs.findIndex((tab) => tab.id === id);
  const tab = tabs[index];
  if (!tab) return tabs;
  const next = [...tabs];
  next[index] = { ...tab, ...patch(tab) };
  return next;
}

/** `tabs` with the tab `id` moved to `index` (clamped). */
export function moveTab(tabs: readonly FileTab[], id: string, index: number): readonly FileTab[] {
  const from = tabs.findIndex((tab) => tab.id === id);
  const tab = tabs[from];
  if (!tab) return tabs;
  const to = clamp(Math.round(index), 0, tabs.length - 1);
  if (to === from) return tabs;
  const next = tabs.filter((other) => other.id !== id);
  next.splice(to, 0, tab);
  return next;
}
