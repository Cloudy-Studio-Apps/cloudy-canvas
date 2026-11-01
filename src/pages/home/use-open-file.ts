import { useCallback } from "react";
import { useNavigate } from "react-router";

import { openCanvasFileDialog } from "@platform";
import { figmaImportOf } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "./home.i18n";

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
          ? await import("@board/ui").then((ui) => ui.importFigJamWithLoading(path))
          : imported === "design"
            ? await import("@design/ui").then((ui) => ui.importFigmaWithLoading(path))
            : await recents.open(path);
      recents.upsert(file);
      await navigate(`/${file.type}/${file.id}`);
    } catch (error) {
      notifyError(t("actions.openFailed"), error);
    }
  }, [navigate]);
}
