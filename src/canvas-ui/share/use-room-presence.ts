import { useEffect } from "react";
import type { Awareness } from "y-protocols/awareness";

import type { CanvasEngine } from "@canvas";
import type { CollaboratorState, PresencePoint, ShareIdentity } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { ownAgentsOn, roomAgents, sameCollaborators } from "./room-agents";
import { mirrorRoomPresence } from "./room-presence";
import type { RoomPresence } from "./room-presence.types";

/** Presence is sent at most this often (cursor moves). */
const SEND_EVERY_MS = 50;

/**
 * A live session's presence on the open file: the others' cursors, selections and pages (and their
 * agents') become collaborators, and this user's own (pointer, view, selection, page) goes to
 * them, with the agents working on the file through this app.
 */
export function useRoomPresence(
  awareness: Awareness | null,
  engine: CanvasEngine<object>,
  fileId: string,
  identity: ShareIdentity,
): void {
  useEffect(() => {
    if (!awareness) return;
    return mirrorRoomPresence(awareness, useCollaboratorsStore.getState());
  }, [awareness]);

  const { name, color } = identity;
  useEffect(() => {
    if (!awareness) return;
    const collaborators = useCollaboratorsStore;
    let cursor: PresencePoint | null = null;
    let agents = ownAgentsOn(collaborators.getState().collaborators, fileId);
    let timer: ReturnType<typeof setTimeout> | null = null;

    const send = () => {
      timer = null;
      const presence: CollaboratorState = {
        fileId,
        scope: engine.scope,
        scopeLabel: engine.scopeLabel(engine.scope),
        cursor,
        viewport: engine.visibleWorldRect(),
        selection: engine.selectedIds(),
        activity: null,
      };
      const state: RoomPresence = {
        user: { name, color },
        presence,
        agents: roomAgents(agents, Date.now()),
      };
      awareness.setLocalState(state);
    };
    const schedule = () => {
      timer ??= setTimeout(send, SEND_EVERY_MS);
    };
    const onPointer = (event: PointerEvent) => {
      cursor = engine.clientToWorld({ x: event.clientX, y: event.clientY });
      schedule();
    };

    send();
    window.addEventListener("pointermove", onPointer);
    const stopView = engine.onViewChange(schedule);
    const stopState = engine.subscribe(schedule);
    // Only the user's agents: mirroring the others' writes to the store too.
    const stopAgents = collaborators.subscribe((state) => {
      const next = ownAgentsOn(state.collaborators, fileId);
      if (sameCollaborators(agents, next)) return;
      agents = next;
      schedule();
    });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("pointermove", onPointer);
      stopView();
      stopState();
      stopAgents();
      awareness.setLocalState(null);
    };
  }, [awareness, engine, fileId, name, color]);
}
