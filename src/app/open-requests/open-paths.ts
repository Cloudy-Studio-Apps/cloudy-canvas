import { importFigmaFile } from "@design/ui";
import { fileNameFromPath, isFigmaPath, isOpenablePath } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { router } from "../router";
import { confirmLeave } from "./confirm-leave";

/** Opens the first Cloudy Canvas file among `paths`, or imports the first Figma file. */
export function openPaths(paths: string[]): void {
  if (paths.length === 0) return;
  const path = paths.find(isOpenablePath);
  if (!path) {
    toast({
      title: "That file can't be opened",
      description: "Cloudy Canvas opens .cboard and .cdesign files, and imports Figma .fig files.",
      tone: "error",
    });
    return;
  }
  confirmLeave(`Open “${fileNameFromPath(path)}”?`, () => void openPath(path));
}

async function openPath(path: string): Promise<void> {
  try {
    const recents = useRecentFilesStore.getState();
    const file = isFigmaPath(path) ? await importFigmaFile(path) : await recents.open(path);
    recents.upsert(file);
    await router.navigate(`/${file.type}/${file.id}`);
  } catch (error) {
    notifyError(
      isFigmaPath(path) ? "The Figma file couldn't be imported" : "The file couldn't be opened",
      error,
    );
  }
}
