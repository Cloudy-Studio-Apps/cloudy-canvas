import { useEffect } from "react";

import { useEngine } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { EXPORT_MERMAID_COMMAND } from "../../er.commands";
import { ER_MODEL } from "../../model/er-model.service";
import { useErMermaidStore } from "./er-mermaid-store";

/** The `er.exportMermaid` command (context menu): the dialog for the selection's diagram. */
export function useExportMermaidCommand(): void {
  const engine = useEngine();
  useEffect(
    () =>
      engine.handleHostAction(EXPORT_MERMAID_COMMAND, () => {
        const er = engine.service(ER_MODEL);
        const selected = engine.getState().selectedId;
        const diagram =
          (selected ? er.diagramOf(selected) : null) ?? useBoardPanelStore.getState().erDiagram;
        if (diagram) useErMermaidStore.getState().open(diagram);
      }),
    [engine],
  );
}
