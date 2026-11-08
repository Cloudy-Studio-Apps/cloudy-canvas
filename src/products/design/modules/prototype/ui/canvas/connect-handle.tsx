import { useEffect, useReducer } from "react";

import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { rightMiddle } from "../../mode";
import { screenOf } from "../../model";
import { PROTOTYPE_TOOLS } from "../../prototype.constants";

/**
 * The square on the right middle of the single selected layer or screen, to drag a link out of
 * (shown with the select tool). It takes no pointer: `PrototypeSelectTool` grabs a press near it.
 */
export function ConnectHandle() {
  const engine = useDesignEngine();
  const id = useDesignState((state) => state.selectedId);
  const tool = useDesignState((state) => state.tool);
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  // Follows the view and the document (a move, an undo).
  useEffect(() => engine.onViewChange(redraw), [engine]);

  if (tool !== PROTOTYPE_TOOLS.select || id === null || !screenOf(engine.doc, id)) return null;
  const el = engine.getElement(id);
  if (!el) return null;
  const at = rightMiddle(engine.worldRectToScreen(el));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-xs border-2 border-primary bg-surface"
        style={{ left: at.x, top: at.y }}
      />
    </div>
  );
}
