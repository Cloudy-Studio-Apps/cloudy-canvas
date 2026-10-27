import { rectCenter, type CanvasEngine } from "@canvas";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import type { ErModeCommand } from "../../mode";
import { erClickActions } from "../../model/er-add-actions";
import { ER_MODEL } from "../../model/er-model.service";

/**
 * One of the ER mode's keys (`ER_MODE_COMMANDS`): adds what clicking its palette item would, to
 * the diagram the panel shows and from the selection, then selects it.
 */
export function runErModeCommand(engine: CanvasEngine, item: ErModeCommand["item"]): void {
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
}
