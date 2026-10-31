import type { Collaborator, PresencePoint } from "@shared/core";

export interface CollaboratorCursorProps {
  collaborator: Collaborator;
  /** Where it points, in world units. */
  at: PresencePoint;
  /** Silent for a while: drawn faded. */
  idle: boolean;
  /** An agent that stopped working: fades out until its next call. */
  hidden: boolean;
}
