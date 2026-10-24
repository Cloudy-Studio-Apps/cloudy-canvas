import { AGENT_SOURCE, type Collaborator } from "@shared/core";
import type { RoomAgent } from "./room-presence.types";

/** The user's own agents on the shared file, in the order they connected. */
export function ownAgentsOn(
  collaborators: Record<string, Collaborator>,
  fileId: string,
): Collaborator[] {
  return Object.values(collaborators)
    .filter((c) => c.source === AGENT_SOURCE && c.state.fileId === fileId)
    .sort((a, b) => a.connectedAt - b.connectedAt);
}

/** The user's agents as the room sees them (an error's message stays on this computer). */
export function roomAgents(agents: readonly Collaborator[], now: number): RoomAgent[] {
  return agents.map((agent) => {
    const { activity } = agent.state;
    return {
      id: agent.id,
      name: agent.name,
      clientId: agent.avatar.type === "agent" ? agent.avatar.clientId : "",
      idleFor: Math.max(0, now - agent.lastSeen),
      running: agent.running,
      presence: {
        ...agent.state,
        activity: activity && { label: activity.label, status: activity.status, startedAt: 0 },
      },
    };
  });
}

/** Whether two lists hold the same collaborators (the store replaces the ones that change). */
export function sameCollaborators(a: readonly Collaborator[], b: readonly Collaborator[]): boolean {
  return a.length === b.length && a.every((c, i) => c === b[i]);
}
