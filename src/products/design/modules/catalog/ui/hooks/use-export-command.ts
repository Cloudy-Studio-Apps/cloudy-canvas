import { useEffect } from "react";

import { CATALOG_COMMANDS } from "../../mode/catalog-mode.constants";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useExportBrochure } from "./use-export-brochure";

/**
 * Runs the Catalog mode's Export PDF command (a hook, not the command's `run`: the export reads
 * the file's name from the editor).
 */
export function useExportCommand(): void {
  const engine = useDesignEngine();
  const exportPdf = useExportBrochure();
  useEffect(
    () => engine.handleHostAction(CATALOG_COMMANDS.exportPdf, () => void exportPdf()),
    [engine, exportPdf],
  );
}
