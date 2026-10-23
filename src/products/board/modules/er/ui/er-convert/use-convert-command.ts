import { useEffect } from "react";

import { ER_MODEL } from "@board";
import { useEngine } from "@canvas-ui";

/** The `er.convertToEntity` command (context menu): the selected relation becomes an entity. */
export function useConvertCommand(): void {
  const engine = useEngine();
  useEffect(
    () =>
      engine.handleHostAction(CONVERT_TO_ENTITY_COMMAND, () => {
        const er = engine.service(ER_MODEL);
        const id = engine.getState().selectedId;
        const diagram = id ? er.diagramOf(id) : null;
        if (!id || !diagram) return;
        const entity = er.diagram(diagram).edits.convertToEntity(id);
        if (entity) engine.focusElement(entity);
      }),
    [engine],
  );
}

/** Turns the selected relation into an entity with a two-way relation per side. */
export const CONVERT_TO_ENTITY_COMMAND = "er.convertToEntity";
