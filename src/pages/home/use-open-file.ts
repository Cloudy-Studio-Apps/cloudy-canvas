import { useCallback } from "react";

import { openCanvasFileDialog } from "@platform";

/** Shows the native open dialog. */
export function useOpenFile(): () => Promise<void> {
  return useCallback(async () => {
    try {
      const path = await openCanvasFileDialog();
      // TODO: Load the file through Storage once real loading exists.
      if (path) console.log("[home] Selected file:", path);
    } catch (error) {
      console.error("[home] Failed to open file dialog:", error);
    }
  }, []);
}
