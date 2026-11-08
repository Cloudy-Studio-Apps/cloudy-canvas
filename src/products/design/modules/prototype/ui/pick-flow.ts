import type { CanvasEngine } from "@canvas";

import { usePrototypeViewStore } from "./stores/prototype-view-store";

/** Picks a flow: the canvas selection clears so the flow is what the panels are about. */
export function pickFlow(engine: CanvasEngine, id: string): void {
  engine.select([]);
  usePrototypeViewStore.getState().selectFlow(id);
}
