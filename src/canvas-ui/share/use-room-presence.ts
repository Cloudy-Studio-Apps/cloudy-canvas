import { useEffect } from "react";
import type { Awareness } from "y-protocols/awareness";

import { MODEL_EDIT_LOCKS, type CanvasEngine } from "@canvas";
import { tabsSupported } from "@platform";
import type { CollaboratorState, PresencePoint, ShareIdentity } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { useRemoteModelLocks } from "../model3d";
import { ownAgentsOn, roomAgents, sameCollaborators } from "./room-agents";
import { mirrorRoomPresence } from "./room-presence";
import type { RoomPresence } from "./room-presence.types";

/** Presence is sent at most this often (cursor moves). */
const SEND_EVERY_MS = 50;

/**
 * A live session's presence on the open file: this user's own (pointer, view, selection, page)
 * goes to the others, with the agents working on the file through this app. Where there are no
 * tabs (Android) it also mirrors the others' cursors, selections and pages (and their agents') into
 * the collaborators; with tabs the app does that (`watchRoomPresence`).
 */
export function useRoomPresence(
  awareness: Awareness | null,
  engine: CanvasEngine<object>,
  fileId: string,
  identity: ShareIdentity,
): void {
  useRemoteModelLocks(engine, fileId);
  useEffect(() => {
    // With tabs the app mirrors each session's people for as long as it lasts (`watchRoomPresence`,
    // `app/tabs/`), editor or not.
    if (!awareness || tabsSupported()) return;
    return mirrorRoomPresence(awareness, useCollaboratorsStore.getState());
  }, [awareness]);

  const { name, color } = identity;
  useEffect(() => {
    if (!awareness) return;
    const collaborators = useCollaboratorsStore;
    const locks = engine.service(MODEL_EDIT_LOCKS);
    let cursor: PresencePoint | null = null;
    let agents = ownAgentsOn(collaborators.getState().collaborators, fileId);
    let timer: ReturnType<typeof setTimeout> | null = null;
    /** What was sent last, to leave in the room (pointer and selection cleared) as the editor goes. */
    let sent: RoomPresence | null = null;

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
        editing: locks.localLock(),
      };
      const state: RoomPresence = {
        user: { name, color },
        presence,
        agents: roomAgents(agents, Date.now()),
      };
      sent = state;
      awareness.setLocalState(state);
    };
    const schedule = () => {
      timer ??= setTimeout(send, SEND_EVERY_MS);
    };
    const onPointer = (event: PointerEvent) => {
      // A tab in the background keeps the cursor where it last was on its canvas.
      if (engine.suspended) return;
      cursor = engine.clientToWorld({ x: event.clientX, y: event.clientY });
      schedule();
    };

    send();
    window.addEventListener("pointermove", onPointer);
    const stopView = engine.onViewChange(schedule);
    const stopState = engine.subscribe(schedule);
    const stopLocks = locks.onChange(schedule);
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
      stopLocks();
      stopAgents();
      // With tabs, the session outlives the editor (its tab keeps the document connected): the
      // user stays in the room, only without a pointer, a selection or a live 3D edit. An
      // awareness already gone (the session ended or was left) has no state to keep.
      if (tabsSupported() && sent && awareness.getLocalState() !== null) {
        const presence = { ...sent.presence, cursor: null, selection: [], editing: null };
        awareness.setLocalState({ ...sent, presence } satisfies RoomPresence);
      } else {
        awareness.setLocalState(null);
      }
    };
  }, [awareness, engine, fileId, name, color]);
}
