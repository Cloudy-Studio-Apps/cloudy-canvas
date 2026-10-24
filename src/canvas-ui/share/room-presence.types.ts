import type { CollaboratorState, ShareIdentity } from "@shared/core";

/**
 * One of a person's agents, as they share it with the room. It has no colour of its own (it's
 * drawn in its owner's) and names its app by id, never by a picture.
 */
export interface RoomAgent {
  /** Its id on its owner's computer. */
  id: string;
  name: string;
  /** Its app (`AgentClient.id`), whose logo is its avatar. */
  clientId: string;
  /** How long ago it last did anything, in ms (not a time: the clocks may differ). */
  idleFor: number;
  /** Calls it hasn't finished. */
  running: number;
  presence: Partial<CollaboratorState>;
}

/** What each person in a live session shares as their awareness state. */
export interface RoomPresence {
  user: ShareIdentity;
  presence: Partial<CollaboratorState>;
  /** Their agents working on the shared file. */
  agents?: RoomAgent[];
}
