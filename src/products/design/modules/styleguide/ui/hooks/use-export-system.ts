import { useCallback } from "react";

import { useCanvasFile, useEditorModules } from "@canvas-ui";
import { exportSystem } from "../../model/export-system";
import { styleguideCategories } from "../../styleguide.points";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { exportFile } from "@platform";
import { runWithLoading } from "@shared/stores/loading-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../../styleguide.i18n";

/** The workspace sections are drawn in, so the user's page never changes. */
const WORKSPACE = "styleguide:export";

/** Exports the whole Design system as one PDF (a page per section) and asks where to save it. */
export function useExportSystem(): () => Promise<void> {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const { name } = useCanvasFile();
  return useCallback(async () => {
    try {
      const file = await runWithLoading(t("export.exporting"), (report) =>
        exportSystem(engine.workspace(WORKSPACE), host.get(styleguideCategories), {
          onProgress: (done, total) => report(t("export.drawing"), { done, total }),
        }),
      );
      await exportFile(file, `${name} - Design system`, {
        extension: "pdf",
        label: t("export.format"),
      });
    } catch (error) {
      notifyError(t("export.failed"), error);
    } finally {
      engine.dropWorkspace(WORKSPACE);
    }
  }, [engine, host, name]);
}
