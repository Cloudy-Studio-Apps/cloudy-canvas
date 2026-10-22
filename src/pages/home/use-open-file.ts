import { useCallback } from "react";
import { useNavigate } from "react-router";

import { importFigmaFile } from "@design/ui";
import { openCanvasFileDialog } from "@platform";
import { isFigmaPath } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError } from "@shared/stores/toast-store";

/** Shows the native open dialog and opens the chosen file in its editor (a Figma file is imported). */
export function useOpenFile(): () => Promise<void> {
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      const path = await openCanvasFileDialog({ figma: true });
      if (!path) return;
      const recents = useRecentFilesStore.getState();
      const file = isFigmaPath(path) ? await importFigmaFile(path) : await recents.open(path);
      recents.upsert(file);
      await navigate(`/${file.type}/${file.id}`);
    } catch (error) {
      notifyError("The file couldn't be opened", error);
    }
  }, [navigate]);
}
