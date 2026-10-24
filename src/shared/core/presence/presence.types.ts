/** A world point (`shared` can't import the canvas's types). */
export interface PresencePoint {
  x: number;
  y: number;
}

/** A world rect. */
export interface PresenceRect extends PresencePoint {
  w: number;
  h: number;
}

/** What kind of collaborator: an AI agent (MCP), or a person in a shared room. */
export type CollaboratorKind = "agent" | "user";

/** What a collaborator's avatar shows: an agent app's logo, or a person's initials. */
export type CollaboratorAvatar =
  { type: "agent"; clientId: string } | { type: "initials"; text: string };

/** What the local user may do to a collaborator's work. */
export interface CollaboratorPermissions {
  /** Undo and redo its steps (agents: yes; people: later, by role). */
  undo: boolean;
}

/** What a collaborator is doing, or did last. */
export interface CollaboratorActivity {
  /** A sentence for people: "Creating shapes", then "Created shapes (3)". */
  label: string;
  status: "running" | "done" | "error";
  startedAt: number;
  /** The error's message when it failed. */
  error?: string;
}

/**
 * Where a collaborator is and what it looks at, as plain JSON (shaped like a Yjs awareness
 * state, so a shared room can send it as is).
 */
export interface CollaboratorState {
  /** The file it works on (`null`: none open). */
  fileId: string | null;
  /** Its scope there (a design's page), `null` for products without scopes. */
  scope: string | null;
  /** The scope's name for people ("Page 2"). */
  scopeLabel: string | null;
  /** Its pointer, in world units. */
  cursor: PresencePoint | null;
  /** The world area it looks at (what following it shows). */
  viewport: PresenceRect | null;
  /** The ids it has selected. */
  selection: readonly string[];
  activity: CollaboratorActivity | null;
}

/** Someone else working on the user's files: an agent now, people in a shared room later. */
export interface Collaborator {
  id: string;
  /** Which presence source it comes from (`"agents"`, a room…). */
  source: string;
  kind: CollaboratorKind;
  /** "Claude Code", or "Claude Code 2" for a second one. */
  name: string;
  /** Its cursor's and ring's colour, as `#rrggbb`. */
  color: string;
  avatar: CollaboratorAvatar;
  permissions: CollaboratorPermissions;
  connectedAt: number;
  /** When it last did anything. */
  lastSeen: number;
  /** Calls (or actions) not finished yet. */
  running: number;
  state: CollaboratorState;
}

/** Who a collaborator is, when it joins (the rest starts empty). */
export type CollaboratorIdentity = Pick<
  Collaborator,
  "id" | "source" | "kind" | "name" | "color" | "avatar" | "permissions"
>;

/** Fields of a collaborator besides its state that a source updates as it works. */
export type CollaboratorMeta = Partial<Pick<Collaborator, "lastSeen" | "running">>;

/**
 * Where presence sources write (the collaborators store): the agent source now, a shared room
 * (Yjs awareness) later. Sources only ever write their own collaborators.
 */
export interface PresenceSink {
  /** Adds the collaborator, or renews who it is when it joins again. */
  join(identity: CollaboratorIdentity): void;
  /** Updates part of its state, and optionally its meta. */
  patch(id: string, state: Partial<CollaboratorState>, meta?: CollaboratorMeta): void;
  leave(id: string): void;
  /** Removes every collaborator of a source (it disconnected). */
  clearSource(source: string): void;
}
