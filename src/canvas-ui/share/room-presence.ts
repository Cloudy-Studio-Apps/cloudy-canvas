import type { Awareness } from "y-protocols/awareness";

import type { CollaboratorIdentity, PresenceSink } from "@shared/core";
import type { RoomAgent, RoomPresence } from "./room-presence.types";

/** The presence source people in live sessions come from. */
export const ROOM_SOURCE = "room";

/** At most this many of one person's agents are shown. */
const MAX_AGENTS = 8;
const MAX_NAME = 40;

/**
 * Mirrors the other people's awareness states into the collaborators (`sink`), so their cursors,
 * selections and pages show like agents', and so do their agents': drawn in their owner's colour
 * and never undone from here (their history is on their owner's computer). Returns the function
 * that stops and forgets them.
 */
export function mirrorRoomPresence(awareness: Awareness, sink: PresenceSink): () => void {
  const joined = new Set<number>();
  /** Each client's agents shown, by collaborator id, with who they were when they joined. */
  const agentsOf = new Map<number, Map<string, string>>();

  const syncAgents = (client: number, room: RoomPresence, now: number) => {
    const shown = agentsOf.get(client) ?? new Map<string, string>();
    agentsOf.set(client, shown);
    const seen = new Set<string>();
    for (const agent of room.agents ?? []) {
      const identity = agentIdentity(client, agent, room);
      const key = JSON.stringify(identity);
      seen.add(identity.id);
      if (shown.get(identity.id) !== key) {
        shown.set(identity.id, key);
        sink.join(identity);
      }
      sink.patch(identity.id, agent.presence, {
        lastSeen: now - agent.idleFor,
        running: agent.running,
      });
    }
    for (const id of shown.keys()) {
      if (seen.has(id)) continue;
      shown.delete(id);
      sink.leave(id);
    }
  };

  const forget = (client: number) => {
    joined.delete(client);
    sink.leave(collaboratorId(client));
    for (const id of agentsOf.get(client)?.keys() ?? []) sink.leave(id);
    agentsOf.delete(client);
  };

  const sync = () => {
    const now = Date.now();
    const seen = new Set<number>();
    for (const [client, state] of awareness.getStates()) {
      if (client === awareness.clientID) continue;
      const room = readRoomPresence(state);
      if (!room) continue;
      seen.add(client);
      const id = collaboratorId(client);
      if (!joined.has(client)) {
        joined.add(client);
        sink.join({
          id,
          source: ROOM_SOURCE,
          kind: "user",
          name: room.user.name,
          color: room.user.color,
          avatar: { type: "initials", text: initials(room.user.name) },
          // Their history is on their computer.
          permissions: { undo: false },
        });
      }
      sink.patch(id, room.presence, { lastSeen: now });
      syncAgents(client, room, now);
    }
    for (const client of joined) {
      if (!seen.has(client)) forget(client);
    }
  };
  sync();
  awareness.on("update", sync);
  return () => {
    awareness.off("update", sync);
    sink.clearSource(ROOM_SOURCE);
  };
}

function collaboratorId(client: number): string {
  return `${ROOM_SOURCE}:${client}`;
}

/** Another person's agent as a collaborator: their colour, its app's logo, their name. */
function agentIdentity(client: number, agent: RoomAgent, room: RoomPresence): CollaboratorIdentity {
  return {
    id: `${collaboratorId(client)}:${agent.id}`,
    source: ROOM_SOURCE,
    kind: "agent",
    name: agent.name,
    color: room.user.color,
    avatar: { type: "agent", clientId: agent.clientId },
    owner: { name: room.user.name },
    // Only its owner undoes its steps.
    permissions: { undo: false },
  };
}

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

/** A peer's awareness state, checked (it comes from another app). */
function readRoomPresence(state: unknown): RoomPresence | null {
  if (!isRecord(state)) return null;
  const { user, presence, agents } = state;
  if (!isRecord(user)) return null;
  const { name, color } = user;
  if (typeof name !== "string" || typeof color !== "string") return null;
  return {
    user: { name: name.slice(0, MAX_NAME), color },
    presence: isRecord(presence) ? presence : {},
    agents: Array.isArray(agents)
      ? agents
          .slice(0, MAX_AGENTS)
          .map(readRoomAgent)
          .filter((agent) => agent !== null)
      : [],
  };
}

/** One agent of a peer's state, checked. */
function readRoomAgent(data: unknown): RoomAgent | null {
  if (!isRecord(data)) return null;
  const { id, name, clientId, idleFor, running, presence } = data;
  if (typeof id !== "string" || typeof name !== "string" || typeof clientId !== "string") {
    return null;
  }
  return {
    id: id.slice(0, 80),
    name: name.slice(0, MAX_NAME),
    clientId: clientId.slice(0, MAX_NAME),
    idleFor: typeof idleFor === "number" && idleFor > 0 ? idleFor : 0,
    running: typeof running === "number" && running > 0 ? Math.floor(running) : 0,
    presence: isRecord(presence) ? presence : {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
