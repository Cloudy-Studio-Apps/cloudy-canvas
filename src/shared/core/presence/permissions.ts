import type { Collaborator } from "./presence.types";

/** Whether the local user may undo and redo this collaborator's steps. */
export function canUndoFor(collaborator: Collaborator): boolean {
  return collaborator.permissions.undo;
}
