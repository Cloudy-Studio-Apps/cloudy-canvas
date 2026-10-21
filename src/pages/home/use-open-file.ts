import { useCallback } from "react";
import { useNavigate } from "react-router";

import { openCanvasFileDialog } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError } from "@shared/stores/toast-store";

/** Shows the native open dialog and opens the chosen file in its editor. */
export function useOpenFile(): () => Promise<void> {
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      const path = await openCanvasFileDialog();
      if (!path) return;
      const file = await useRecentFilesStore.getState().open(path);
      await navigate(`/${file.type}/${file.id}`);
    } catch (error) {
      notifyError("The file couldn't be opened", error);
    }
  }, [navigate]);
}
