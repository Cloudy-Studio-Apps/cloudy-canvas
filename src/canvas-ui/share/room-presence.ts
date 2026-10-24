import type { Awareness } from "y-protocols/awareness";

import type { PresenceSink } from "@shared/core";
import type { RoomPresence } from "./room-presence.types";

/** The presence source people in live sessions come from. */
export const ROOM_SOURCE = "room";

/**
 * Mirrors the other people's awareness states into the collaborators (`sink`), so their cursors,
 * selections and pages show like agents'. Returns the function that stops and forgets them.
 */
export function mirrorRoomPresence(awareness: Awareness, sink: PresenceSink): () => void {
  const joined = new Set<number>();
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
    }
    for (const client of joined) {
      if (seen.has(client)) continue;
      joined.delete(client);
      sink.leave(collaboratorId(client));
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
  if (typeof state !== "object" || state === null) return null;
  const { user, presence } = state as Record<string, unknown>;
  if (typeof user !== "object" || user === null) return null;
  const { name, color } = user as Record<string, unknown>;
  if (typeof name !== "string" || typeof color !== "string") return null;
  return {
    user: { name: name.slice(0, 40), color },
    presence: typeof presence === "object" && presence !== null ? presence : {},
  };
}
