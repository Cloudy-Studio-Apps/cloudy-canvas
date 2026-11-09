import type { ActorWorkspace } from "@canvas";
import type { CollaboratorState, PresencePoint, PresenceRect } from "@shared/core";

/**
 * Where the cursor goes after a call: the middle of what it touched; else where it was, when
 * that's on the same file and page; else the middle of the agent's view.
 */
export function cursorAfter(
  touched: PresenceRect | null,
  previous: CollaboratorState | undefined,
  fileId: string,
  workspace: ActorWorkspace<object>,
): PresencePoint {
  if (touched) return centerOf(touched);
  const samePlace = previous?.fileId === fileId && previous.scope === workspace.scope;
  return samePlace && previous.cursor ? previous.cursor : centerOf(workspace.viewport);
}

/** The point at the middle of a box, or the point itself. */
function centerOf(spot: PresencePoint | PresenceRect): PresencePoint {
  return "w" in spot ? { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 } : spot;
}
