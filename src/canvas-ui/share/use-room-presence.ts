import { useEffect } from "react";
import type { Awareness } from "y-protocols/awareness";

import type { CanvasEngine } from "@canvas";
import type { CollaboratorState, PresencePoint, ShareIdentity } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { mirrorRoomPresence } from "./room-presence";
import type { RoomPresence } from "./room-presence.types";

/** Presence is sent at most this often (cursor moves). */
const SEND_EVERY_MS = 50;

/**
 * A live session's presence on the open file: the others' cursors, selections and pages become
 * collaborators, and this user's own (pointer, view, selection, page) goes to them.
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
    let cursor: PresencePoint | null = null;
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
      const state: RoomPresence = { user: { name, color }, presence };
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
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("pointermove", onPointer);
      stopView();
      stopState();
      awareness.setLocalState(null);
    };
  }, [awareness, engine, fileId, name, color]);
}
