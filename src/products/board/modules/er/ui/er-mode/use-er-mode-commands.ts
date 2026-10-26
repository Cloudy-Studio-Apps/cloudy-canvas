import { useEffect } from "react";

import { ER_MODE_COMMANDS } from "../../mode/er-mode-commands";
import { ER_MODEL } from "../../model/er-model.service";
import { erClickActions } from "../../model/er-add-actions";
import { rectCenter } from "@canvas";
import { useEngine } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";

/**
 * Handles the ER mode's keys (`ER_MODE_COMMANDS`): each adds what clicking its palette item would,
 * to the diagram the panel shows and from the selection, then selects it.
 */
export function useErModeCommands(): void {
  const engine = useEngine();
  useEffect(() => {
    const offs = ER_MODE_COMMANDS.map(({ command, item }) =>
      engine.handleHostAction(command, () => {
        const actions = erClickActions(
          engine.service(ER_MODEL),
          useBoardPanelStore.getState().erDiagram,
          engine.getState().selectedId,
          () => rectCenter(engine.visibleWorldRect()),
        );
        const action = actions[item];
        if (action.disabled) return;
        const id = action.run();
        if (id) engine.focusElement(id);
      }),
    );
    return () => offs.forEach((off) => off());
  }, [engine]);
}
