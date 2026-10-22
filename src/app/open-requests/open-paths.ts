import { fileNameFromPath, fileTypeFromPath } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { router } from "../router";
import { confirmLeave } from "./confirm-leave";

/** Opens the first Cloudy Canvas file among `paths`. */
export function openPaths(paths: string[]): void {
  if (paths.length === 0) return;
  const path = paths.find((p) => fileTypeFromPath(p) !== null);
  if (!path) {
    toast({
      title: "That file can't be opened",
      description: "Cloudy Canvas opens .cboard and .cdesign files.",
      tone: "error",
    });
    return;
  }
  confirmLeave(`Open “${fileNameFromPath(path)}”?`, () => void openPath(path));
}

async function openPath(path: string): Promise<void> {
  try {
    const file = await useRecentFilesStore.getState().open(path);
    await router.navigate(`/${file.type}/${file.id}`);
  } catch (error) {
    notifyError("The file couldn't be opened", error);
  }
}
