import type { CanvasDocument } from "../document";
import type { Point } from "../geometry.types";

/** How far each nudge command moves the selection: 1 unit, or 10 with Shift. */
export const NUDGE_STEPS = {
  nudgeLeft: { x: -1, y: 0 },
  nudgeRight: { x: 1, y: 0 },
  nudgeUp: { x: 0, y: -1 },
  nudgeDown: { x: 0, y: 1 },
  nudgeLeftFar: { x: -10, y: 0 },
  nudgeRightFar: { x: 10, y: 0 },
  nudgeUpFar: { x: 0, y: -10 },
  nudgeDownFar: { x: 0, y: 10 },
} as const satisfies Record<string, Point>;

/** Presses closer together than this are one undo step. */
const BURST_MS = 1000;

const lastNudge = new WeakMap<CanvasDocument, number>();

/** The step of a nudge command, or `null` for any other command. */
export function nudgeStep(command: string): Point | null {
  return Object.hasOwn(NUDGE_STEPS, command)
    ? NUDGE_STEPS[command as keyof typeof NUDGE_STEPS]
    : null;
}

/**
 * Starts an undo step for a nudge, unless the last one was just before: holding or tapping an
 * arrow key is one Ctrl+Z.
 */
export function nudgeCheckpoint(doc: CanvasDocument): void {
  const now = performance.now();
  if (now - (lastNudge.get(doc) ?? -Infinity) > BURST_MS) doc.checkpoint();
  lastNudge.set(doc, now);
}
