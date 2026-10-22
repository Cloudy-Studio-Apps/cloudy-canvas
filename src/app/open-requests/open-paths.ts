import { importFigJamWithLoading } from "@board/ui";
import { importFigmaWithLoading } from "@design/ui";
import { figmaImportOf, fileNameFromPath, isOpenablePath, type FileType } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { router } from "../router";
import { confirmLeave } from "./confirm-leave";
import type { FigmaImporter } from "./open-paths.types";

/** Opens the first Cloudy Canvas file among `paths`, or imports the first Figma or FigJam file. */
export function openPaths(paths: string[]): void {
  if (paths.length === 0) return;
  const path = paths.find(isOpenablePath);
  if (!path) {
    toast({
      title: "That file can't be opened",
      description:
        "Cloudy Canvas opens .cboard and .cdesign files, and imports Figma .fig and FigJam .jam files.",
      tone: "error",
    });
    return;
  }
  confirmLeave(`Open “${fileNameFromPath(path)}”?`, () => void openPath(path));
}

/** How each kind of Figma file is imported: a FigJam file as a board, a Figma file as a design. */
const IMPORTERS: Record<FileType, FigmaImporter> = {
  board: { run: importFigJamWithLoading, failed: "The FigJam file couldn't be imported" },
  design: { run: importFigmaWithLoading, failed: "The Figma file couldn't be imported" },
};

async function openPath(path: string): Promise<void> {
  const imported = figmaImportOf(path);
  const importer = imported && IMPORTERS[imported];
  try {
    const recents = useRecentFilesStore.getState();
    const file = importer ? await importer.run(path) : await recents.open(path);
    recents.upsert(file);
    await router.navigate(`/${file.type}/${file.id}`);
  } catch (error) {
    notifyError(importer?.failed ?? "The file couldn't be opened", error);
  }
}
