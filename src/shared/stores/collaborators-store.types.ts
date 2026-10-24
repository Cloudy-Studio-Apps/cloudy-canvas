import type { Collaborator, PresenceSink } from "@shared/core";

/** The collaborators working on the user's files, and who the user follows. App UI state only. */
export interface CollaboratorsState extends PresenceSink {
  /** By id. */
  collaborators: Record<string, Collaborator>;
  /** The collaborator whose view the user's camera follows, `null` when following no one. */
  following: string | null;
  follow(id: string): void;
  unfollow(): void;
  /** Forgets collaborators silent for longer than `COLLABORATOR_GONE_MS`. */
  prune(now: number): void;
}
