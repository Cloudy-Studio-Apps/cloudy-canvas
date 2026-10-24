import type { CollaboratorState } from "./presence.types";

/** A collaborator's state before it has done anything. */
export const EMPTY_COLLABORATOR_STATE: CollaboratorState = {
  fileId: null,
  scope: null,
  scopeLabel: null,
  cursor: null,
  viewport: null,
  selection: [],
  activity: null,
};
