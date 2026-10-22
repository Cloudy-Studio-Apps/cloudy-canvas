import type { CanvasPointer } from "./tool.types";

/** How far (screen px) the pointer moves before a press on something existing becomes a drag. */
export const MOVE_THRESHOLD_PX = 3;

/** How far (screen px) the pointer moves before a creating tool draws instead of placing. */
export const DRAW_THRESHOLD_PX = 4;

/** Whether the pointer moved at least `px` screen pixels from where it was pressed. */
export function pastThreshold(start: CanvasPointer, p: CanvasPointer, px: number): boolean {
  return Math.hypot(p.screen.x - start.screen.x, p.screen.y - start.screen.y) >= px;
}
