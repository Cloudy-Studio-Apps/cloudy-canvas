import { useEffect } from "react";

import { useEngine } from "@canvas-ui";
import { EXPORT_CODE_COMMAND } from "../db-export.commands";
import { useCodeExportStore } from "./code-export-store";
import { selectedDbIds } from "./selected-db-ids";

/** The `db.exportCode` command (context menu): the dialog for the selected tables and enums. */
export function useExportCodeCommand(): void {
  const engine = useEngine();
  useEffect(
    () =>
      engine.handleHostAction(EXPORT_CODE_COMMAND, () => {
        useCodeExportStore.getState().open(selectedDbIds(engine));
      }),
    [engine],
  );
}
