import { useEffect } from "react";

import { DESIGN_STYLEGUIDE } from "../../model/design-styleguide";
import { isSheet } from "../../sheet/is-sheet";
import { STYLEGUIDE_COMMANDS, STYLEGUIDE_MODE_ID } from "../../mode/styleguide-mode.constants";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useExportSystem } from "./use-export-system";

/**
 * Runs the Design system's commands (a session hook): open the view, convert the selected live
 * elements, export the selected section (the export dialog) or the whole system as a PDF.
 */
export function useStyleguideCommands(): void {
  const engine = useDesignEngine();
  const exportPdf = useExportSystem();

  useEffect(() => {
    const selectedSheets = () =>
      engine.selectedIds().filter((id) => isSheet(engine.getElement(id)));
    const removers = [
      engine.handleHostAction(STYLEGUIDE_COMMANDS.open, () => engine.setMode(STYLEGUIDE_MODE_ID)),
      engine.handleHostAction(STYLEGUIDE_COMMANDS.convert, () => {
        const ids = selectedSheets();
        if (ids.length > 0) engine.service(DESIGN_STYLEGUIDE).convert(ids);
      }),
      engine.handleHostAction(STYLEGUIDE_COMMANDS.exportSection, () => {
        const ids = selectedSheets();
        if (ids.length === 0) return;
        engine.select(ids);
        engine.runHostAction("export");
      }),
      engine.handleHostAction(STYLEGUIDE_COMMANDS.exportSystem, () => void exportPdf()),
    ];
    return () => {
      for (const remove of removers) remove();
    };
  }, [engine, exportPdf]);
}
