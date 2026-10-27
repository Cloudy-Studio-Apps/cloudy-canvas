import { createId, displayName, parseAppLink, type AppLink, type FileType } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { toast } from "@shared/stores/toast-store";
import { router } from "../router";
import { confirmLeave } from "./confirm-leave";
import { openPaths } from "./open-paths";
import { t } from "../app.i18n";

const PAGE_PATHS = { home: "/", settings: "/settings" } as const;

/** Does what the last `cloudy-canvas://` link among `links` asks for. */
export function openAppLinks(links: string[]): void {
  const link = links.at(-1);
  if (link === undefined) return;
  const parsed = parseAppLink(link);
  if (!parsed) {
    toast({
      title: t("links.invalid"),
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
      confirmLeave(t(link.type === "board" ? "links.newBoard" : "links.newDesign"), () =>
        navigate(`/${link.type}/${createId()}`),
      );
      return;
    case "page":
      confirmLeave(t(link.page === "home" ? "links.openHome" : "links.openSettings"), () =>
        navigate(PAGE_PATHS[link.page]),
      );
      return;
    case "join":
      confirmLeave(t("links.join"), () => navigate(`/join/${link.ticket}`));
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
      title: t("links.notRecent"),
      description: t("links.notRecentHint"),
      tone: "error",
    });
    return;
  }
  confirmLeave(t("links.openFile", { name: displayName(file) }), () =>
    navigate(`/${file.type}/${file.id}`),
  );
}

function navigate(path: string): void {
  void router.navigate(path);
}
