import { useEffect } from "react";

import { asUndoStep } from "@canvas";
import { BOOLEAN_OPERATIONS, booleanNodes, flattenNodes, outlineStrokes } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { BOOLEAN_COMMANDS } from "./boolean-icons";

/**
 * Runs the boolean commands on the selection: Union, Subtract, Intersect and Exclude (Alt+Shift+
 * U/S/I/E), Flatten (Ctrl+E) and Outline stroke (Ctrl+Shift+O), each one undo step.
 */
export function useBooleanCommands(): void {
  const engine = useDesignEngine();
  useEffect(() => {
    const run = (edit: (ids: ReadonlySet<string>) => string[]) => () => {
      const ids = new Set(engine.selectedIds());
      const selected = asUndoStep(engine.doc, () => edit(ids));
      if (selected.length > 0) engine.select(selected);
    };
    const removers = [
      ...BOOLEAN_OPERATIONS.map(({ operation }) =>
        engine.handleHostAction(
          BOOLEAN_COMMANDS[operation],
          run((ids) => booleanNodes(engine.doc, ids, operation, engine.elements(), engine.kinds)),
        ),
      ),
      engine.handleHostAction(
        "flatten",
        run((ids) => flattenNodes(engine.doc, ids, engine.elements(), engine.kinds)),
      ),
      engine.handleHostAction(
        "outlineStroke",
        run((ids) => outlineStrokes(engine.doc, ids, engine.elements(), engine.kinds)),
      ),
    ];
    return () => {
      for (const remove of removers) remove();
    };
  }, [engine]);
}
