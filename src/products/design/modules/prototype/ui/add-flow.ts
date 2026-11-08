import type { CanvasEngine } from "@canvas";

import { toast } from "@shared/stores/toast-store";
import { DESIGN_PROTOTYPE, screenOf } from "../model";
import { usePrototypeViewStore } from "./stores/prototype-view-store";
import { t } from "../prototype.i18n";

/** The screen the one selected element is on (or is), `null` for none or several. */
export function selectedScreenId(engine: CanvasEngine): string | null {
  const ids = engine.selectedIds();
  const [id] = ids;
  return ids.length === 1 && id !== undefined ? (screenOf(engine.doc, id)?.id ?? null) : null;
}

/** Adds a flow starting at a screen of the page on screen and picks it. One undo step. */
export function addFlowAt(engine: CanvasEngine, screenId: string): void {
  if (engine.scope === null) return;
  const flow = engine.service(DESIGN_PROTOTYPE).addFlow(engine.scope, screenId);
  engine.select([]);
  usePrototypeViewStore.getState().selectFlow(flow.id);
}

/** The "Add flow start" command: a flow at the selection's screen, if it starts none yet. */
export function addFlowAtSelection(engine: CanvasEngine): void {
  const screen = selectedScreenId(engine);
  if (screen === null || engine.scope === null) {
    toast({ title: t("flows.needScreen") });
    return;
  }
  if (
    engine
      .service(DESIGN_PROTOTYPE)
      .flows(engine.scope)
      .some((flow) => flow.start === screen)
  ) {
    toast({ title: t("flows.alreadyStarts") });
    return;
  }
  addFlowAt(engine, screen);
}
