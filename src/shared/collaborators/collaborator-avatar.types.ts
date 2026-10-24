import type { Collaborator } from "@shared/core";

export interface CollaboratorAvatarProps {
  collaborator: Collaborator;
  /** Silent for a while: drawn faded. */
  idle?: boolean;
  /** The user follows it: drawn with a second ring. */
  followed?: boolean;
  className?: string;
}
