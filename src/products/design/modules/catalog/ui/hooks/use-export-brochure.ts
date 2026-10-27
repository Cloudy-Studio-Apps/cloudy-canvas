import { useCallback } from "react";

import { useCanvasFile } from "@canvas-ui";
import { DESIGN_BROCHURES } from "../../model/design-brochures";
import { exportBrochure } from "../../export/export-brochure";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { exportFile } from "@platform";
import { runWithLoading } from "@shared/stores/loading-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../../catalog.i18n";

/** The workspace pages are drawn in, so the user's page never changes. */
const WORKSPACE = "catalog:export";

/** Exports the page's open brochure as one PDF (drawing each page, with progress) and asks where to save it. */
export function useExportBrochure(): () => Promise<void> {
  const engine = useDesignEngine();
  const { name } = useCanvasFile();
  return useCallback(async () => {
    try {
      const brochure = engine.service(DESIGN_BROCHURES).current(engine.scope);
      if (!brochure) throw new Error("This page has no brochure yet.");
      const file = await runWithLoading(t("export.exporting"), (report) =>
        exportBrochure(engine.workspace(WORKSPACE), brochure, {
          onProgress: (done, total) => report(t("export.drawing"), { done, total }),
        }),
      );
      await exportFile(file, `${name} - ${brochure.name}`, {
        extension: "pdf",
        label: t("export.label"),
      });
    } catch (error) {
      notifyError(t("export.failed"), error);
    } finally {
      engine.dropWorkspace(WORKSPACE);
    }
  }, [engine, name]);
}
