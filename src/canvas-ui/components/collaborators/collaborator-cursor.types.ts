import type { Collaborator, PresencePoint } from "@shared/core";

export interface CollaboratorCursorProps {
  collaborator: Collaborator;
  /** Where it points, in world units. */
  at: PresencePoint;
  /** Silent for a while: drawn faded. */
  idle: boolean;
}
