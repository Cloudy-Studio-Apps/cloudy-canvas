import type { CollaboratorState, ShareIdentity } from "@shared/core";

/** What each person in a live session shares as their awareness state. */
export interface RoomPresence {
  user: ShareIdentity;
  presence: Partial<CollaboratorState>;
}
