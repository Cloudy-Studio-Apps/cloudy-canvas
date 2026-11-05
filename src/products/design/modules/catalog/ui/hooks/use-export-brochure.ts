import { useCallback } from "react";

import { useCanvasFile } from "@canvas-ui";
import { DESIGN_BROCHURES } from "../../model/design-brochures";
import {
  brochureSources,
  exportBrochure,
  SourceUpdateError,
  updateBrochureSources,
} from "../../export";
import { updateErrorText } from "../../../data/ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { exportFile } from "@platform";
import { runWithLoading } from "@shared/stores/loading-store";
import { notifyError } from "@shared/stores/toast-store";
import { useExportDataStore } from "../stores/export-data-store";
import { t } from "../../catalog.i18n";

/** The workspace pages are drawn in, so the user's page never changes. */
const WORKSPACE = "catalog:export";

/**
 * Exports the page's open brochure as one PDF and asks where to save it. When the brochure reads
 * data sources it first asks whether to update them (`ExportDataPrompt`; Esc cancels): they're
 * updated as their Update buttons do, in the user's undo history, and if one fails nothing is
 * exported. Every page the brochure prints is made (on a copy of the design when the document
 * holds fewer, see `exportBrochure`) and drawn, with progress on the loading screen.
 */
export function useExportBrochure(): () => Promise<void> {
  const engine = useDesignEngine();
  const { name } = useCanvasFile();
  return useCallback(async () => {
    try {
      const brochure = engine.service(DESIGN_BROCHURES).current(engine.scope);
      const record = brochure?.record();
      if (!brochure || !record) throw new Error("This page has no brochure yet.");
      const sources = brochureSources(engine.doc, record);
      let data: "update" | "saved" = "saved";
      if (sources.length > 0) {
        const answer = await useExportDataStore.getState().ask(
          sources.map((source) => ({
            id: source.id,
            name: source.name,
            updatedAt: source.snapshot?.updatedAt ?? null,
          })),
        );
        if (answer === null) return;
        data = answer;
      }
      const { file } = await runWithLoading(t("export.exporting"), async (report) => {
        if (data === "update") {
          await updateBrochureSources(
            engine,
            sources.map((source) => source.id),
            (source) => report(t("export.updating", { name: source })),
          );
        }
        return exportBrochure(engine.workspace(WORKSPACE), brochure, {
          onStep: (step) => {
            if (step.step === "making") report(t("export.making"));
          },
          onProgress: (done, total) => report(t("export.drawing"), { done, total }),
        });
      });
      await exportFile(file, `${name} - ${brochure.name}`, {
        extension: "pdf",
        label: t("export.label"),
      });
    } catch (error) {
      if (error instanceof SourceUpdateError) {
        notifyError(
          t("export.updateFailed", { name: error.source }),
          new Error(updateErrorText(error.reason)),
        );
      } else notifyError(t("export.failed"), error);
    } finally {
      engine.dropWorkspace(WORKSPACE);
    }
  }, [engine, name]);
}
