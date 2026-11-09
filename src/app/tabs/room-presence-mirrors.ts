import type { Awareness } from "y-protocols/awareness";

import type { FileTabs } from "@canvas/tabs";
import { mirrorRoomPresence } from "@canvas-ui/share/room-presence";
import { sharingState } from "@canvas-ui/share/sharing-state";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";

/**
 * Mirrors the people (and their agents) of every live session this app is in into the
 * collaborators (`mirrorRoomPresence`), for as long as the session lasts, whether its tab's editor
 * is mounted or not: the hosted file's (`sharingState`) and each joined tab's (`tab.live`). So a
 * live tab in the background still shows who is in it on its button. Each room's people are
 * forgotten when its session ends, leaving the others'. Returns how to stop.
 */
export function watchRoomPresence(tabs: FileTabs): () => void {
  const mirrors = new Map<Awareness, () => void>();
  const sync = () => {
    const rooms = new Set<Awareness>();
    const hosted = sharingState.current();
    if (hosted) rooms.add(hosted.awareness);
    for (const tab of tabs.store.get().tabs) if (tab.live) rooms.add(tab.live.awareness);
    for (const [awareness, stop] of mirrors) {
      if (rooms.has(awareness)) continue;
      mirrors.delete(awareness);
      stop();
    }
    for (const awareness of rooms) {
      if (!mirrors.has(awareness))
        mirrors.set(awareness, mirrorRoomPresence(awareness, useCollaboratorsStore.getState()));
    }
  };
  sync();
  const stopSharingWatch = sharingState.subscribe(sync);
  const stopTabsWatch = tabs.store.subscribe(sync);
  return () => {
    stopSharingWatch();
    stopTabsWatch();
    for (const stop of mirrors.values()) stop();
    mirrors.clear();
  };
}
