import { useCallback } from "react";

import { useCanvasFile } from "@canvas-ui";
import { exportBrochure } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { exportFile } from "@platform";
import { runWithLoading } from "@shared/stores/loading-store";
import { notifyError } from "@shared/stores/toast-store";

/** The workspace pages are drawn in, so the user's page never changes. */
const WORKSPACE = "catalog:export";

/** Exports the brochure as one PDF (drawing each page, with progress) and asks where to save it. */
export function useExportBrochure(): () => Promise<void> {
  const engine = useDesignEngine();
  const { name } = useCanvasFile();
  return useCallback(async () => {
    try {
      const file = await runWithLoading("Exporting the brochure", (report) =>
        exportBrochure(engine.workspace(WORKSPACE), {
          onProgress: (done, total) => report("Drawing the pages", { done, total }),
        }),
      );
      await exportFile(file, name, { extension: "pdf", label: "PDF document" });
    } catch (error) {
      notifyError("The brochure couldn't be exported", error);
    } finally {
      engine.dropWorkspace(WORKSPACE);
    }
  }, [engine, name]);
}
