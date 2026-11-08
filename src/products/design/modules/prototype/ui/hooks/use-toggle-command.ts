import { useEffect } from "react";

import { useEditorMode } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { PROTOTYPE_COMMANDS, PROTOTYPE_MODE_ID } from "../../prototype.constants";

/** Runs the toggle command (Shift+E): into the Prototype mode, or back to designing. */
export function useToggleCommand(): void {
  const engine = useDesignEngine();
  const mode = useEditorMode();
  useEffect(
    () =>
      engine.handleHostAction(PROTOTYPE_COMMANDS.toggle, () =>
        mode.id === PROTOTYPE_MODE_ID ? mode.leave() : mode.setMode(PROTOTYPE_MODE_ID),
      ),
    [engine, mode],
  );
}
