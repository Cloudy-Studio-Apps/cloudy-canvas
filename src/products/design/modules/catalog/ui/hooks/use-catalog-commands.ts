import { useEffect } from "react";

import { CATALOG_COMMANDS, CATALOG_PICK_TOOL } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochurePreviewStore } from "../stores/preview-store";
import { useExportBrochure } from "./use-export-brochure";

/** Runs the Catalog mode's commands: pick frames, preview and export the PDF. */
export function useCatalogCommands(): void {
  const engine = useDesignEngine();
  const exportPdf = useExportBrochure();

  useEffect(() => {
    const removers = [
      engine.handleHostAction(CATALOG_COMMANDS.pick, () => engine.setTool(CATALOG_PICK_TOOL)),
      engine.handleHostAction(CATALOG_COMMANDS.preview, () =>
        useBrochurePreviewStore.getState().open(),
      ),
      engine.handleHostAction(CATALOG_COMMANDS.exportPdf, () => void exportPdf()),
    ];
    return () => {
      for (const remove of removers) remove();
    };
  }, [engine, exportPdf]);
}
