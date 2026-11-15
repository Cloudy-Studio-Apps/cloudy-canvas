import type { CanvasDocument } from "@canvas";

import { copyPageInto } from "../../pages";
import { systemPageOf } from "./system-page";

/**
 * A page split out into a new file keeps the Design system view (its hidden page, settings and
 * sheets) when the new file got variables or styles and this design has the view.
 */
export function copySystemPage(source: CanvasDocument, target: CanvasDocument): void {
  if (target.tokenRecords().length === 0) return;
  const system = systemPageOf(source);
  if (system) copyPageInto(source, target, system.id);
}
