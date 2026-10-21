import { useCallback } from "react";
import { useNavigate } from "react-router";

import { openCanvasFileDialog, storage } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";

/** Shows the native open dialog and opens the chosen file in its editor. */
export function useOpenFile(): () => Promise<void> {
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      const path = await openCanvasFileDialog();
      if (!path) return;
      const file = await storage.register(path);
      useRecentFilesStore.getState().upsert(file);
      await navigate(`/${file.type}/${file.id}`);
    } catch (error) {
      console.error("[home] Failed to open file:", error);
    }
  }, [navigate]);
}
