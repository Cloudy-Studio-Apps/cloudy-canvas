import type { Collaborator } from "@shared/core";
import type { CollaboratorHistory } from "./use-collaborator-history.types";

/** Who the user follows on this file, and that collaborator's history when it can be undone. */
export interface FollowedCollaborator {
  collaborator: Collaborator;
  history: CollaboratorHistory | null;
}
