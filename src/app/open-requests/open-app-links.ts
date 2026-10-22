import { createId, displayName, parseAppLink, type AppLink, type FileType } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { toast } from "@shared/stores/toast-store";
import { router } from "../router";
import { confirmLeave } from "./confirm-leave";
import { openPaths } from "./open-paths";

const PAGE_PATHS = { home: "/", settings: "/settings" } as const;

/** Does what the last `cloudy-canvas://` link among `links` asks for. */
export function openAppLinks(links: string[]): void {
  const link = links.at(-1);
  if (link === undefined) return;
  const parsed = parseAppLink(link);
  if (!parsed) {
    toast({
      title: "That link can't be opened",
      description: link,
      tone: "error",
    });
    return;
  }
  void openAppLink(parsed);
}

async function openAppLink(link: AppLink): Promise<void> {
  switch (link.action) {
    case "open":
      openPaths([link.path]);
      return;
    case "show":
      await showFile(link.type, link.id);
      return;
    case "new":
      confirmLeave(`Start a new ${link.type}?`, () => navigate(`/${link.type}/${createId()}`));
      return;
    case "page":
      confirmLeave(`Open ${link.page}?`, () => navigate(PAGE_PATHS[link.page]));
      return;
  }
}

/** Opens a recent file by id; an id the recents don't know would start an empty file. */
async function showFile(type: FileType, id: string): Promise<void> {
  const recents = useRecentFilesStore.getState();
  if (!recents.files.some((file) => file.id === id)) await recents.refresh();
  const file = useRecentFilesStore.getState().files.find((f) => f.id === id && f.type === type);
  if (!file) {
    toast({
      title: "That file isn't in your recent files",
      description: "Open it from disk once, then its link works.",
      tone: "error",
    });
    return;
  }
  confirmLeave(`Open “${displayName(file)}”?`, () => navigate(`/${file.type}/${file.id}`));
}

function navigate(path: string): void {
  void router.navigate(path);
}
