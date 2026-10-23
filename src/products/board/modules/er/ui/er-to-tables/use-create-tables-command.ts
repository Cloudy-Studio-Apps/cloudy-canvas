import { useEffect } from "react";

import { ER_MODEL } from "@board";
import { useEngine } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErToTablesStore } from "./er-to-tables-store";

/** The `er.createTables` command (context menu): the dialog for the selection's diagram. */
export function useCreateTablesCommand(): void {
  const engine = useEngine();
  useEffect(
    () =>
      engine.handleHostAction(CREATE_TABLES_COMMAND, () => {
        const er = engine.service(ER_MODEL);
        const selected = engine.getState().selectedId;
        const diagram =
          (selected ? er.diagramOf(selected) : null) ?? useBoardPanelStore.getState().erDiagram;
        if (diagram) useErToTablesStore.getState().open(diagram);
      }),
    [engine],
  );
}

/** Opens "Create tables" for the selected ER shape's diagram. */
export const CREATE_TABLES_COMMAND = "er.createTables";
