import { useCallback } from "react";
import { useNavigate } from "react-router";

import { importFigJamWithLoading } from "@board/ui";
import { importFigmaWithLoading } from "@design/ui";
import { openCanvasFileDialog } from "@platform";
import { figmaImportOf } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError } from "@shared/stores/toast-store";

/**
 * Shows the native open dialog and opens the chosen file in its editor (a Figma file is imported
 * as a design, a FigJam file as a board).
 */
export function useOpenFile(): () => Promise<void> {
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      const path = await openCanvasFileDialog({ figma: true });
      if (!path) return;
      const recents = useRecentFilesStore.getState();
      const imported = figmaImportOf(path);
      const file =
        imported === "board"
          ? await importFigJamWithLoading(path)
          : imported === "design"
            ? await importFigmaWithLoading(path)
            : await recents.open(path);
      recents.upsert(file);
      await navigate(`/${file.type}/${file.id}`);
    } catch (error) {
      notifyError("The file couldn't be opened", error);
    }
  }, [navigate]);
}
