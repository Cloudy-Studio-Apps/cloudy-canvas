import type { CanvasEngine } from "@canvas";

import { DESIGN_PROTOTYPE } from "../model";

/** The "Remove interactions" command (Delete): clears the selection's interactions, one undo step. */
export function removeSelectionInteractions(engine: CanvasEngine): void {
  engine.service(DESIGN_PROTOTYPE).removeInteractions(engine.selectedIds());
}
