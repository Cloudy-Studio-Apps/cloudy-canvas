import type { CanvasEngine } from "@canvas";
import { isDbEnum, isDbTable } from "../../db";

/** The selected tables and enums. */
export function selectedDbIds(engine: CanvasEngine): string[] {
  return engine.selectedIds().filter((id) => {
    const el = engine.getElement(id);
    return isDbTable(el) || isDbEnum(el);
  });
}
