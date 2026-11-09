import { useSyncExternalStore } from "react";

import type { ShareHost, ShareHostOptions } from "@canvas";
import { appLifecycle } from "@platform";
import { toast } from "@shared/stores/toast-store";
import type { HostedSession } from "./host-session.types";
import { sharingState } from "./sharing-state";
import { startHost } from "./start-host";
import { t } from "./share.i18n";

/** The one file this app shares at a time. */
let current: HostedSession | null = null;

/**
 * Starts sharing a file (ending any other session first), through n0's public relays when the
 * built-in one can't be reached (`startHost`). Closing the window tells the guests the session
 * ended before it goes. `sharingState` follows its knocks' count (the hosting tab's badge).
 */
export async function startSharing(fileId: string, options: ShareHostOptions): Promise<ShareHost> {
  await stopSharing();
  const host = await startHost(options);
  const releaseQuit = appLifecycle.onBeforeQuit(() => host.stop());
  const countKnocks = () => sharingState.setKnocks(host.state.get().knocks.length);
  const stopKnocks = host.state.subscribe(countKnocks);
  current = {
    fileId,
    host,
    release: () => {
      releaseQuit();
      stopKnocks();
    },
  };
  sharingState.set({ fileId, awareness: host.awareness });
  countKnocks();
  return host;
}

/** Ends the shared session: guests are told and disconnected. */
export async function stopSharing(): Promise<void> {
  const session = current;
  if (!session) return;
  current = null;
  sharingState.set(null);
  session.release();
  await session.host.stop();
}

/** The session sharing the file with this id, `null` while it isn't shared. */
export function useHostedSession(fileId: string): ShareHost | null {
  return useSyncExternalStore(sharingState.subscribe, () =>
    current && current.fileId === fileId ? current.host : null,
  );
}

/** Whether the file with this id is the one being shared now. */
export function isSharing(fileId: string): boolean {
  return current?.fileId === fileId;
}

/**
 * Ends the session when it shares the file with this id (its tab closing, or its editor where
 * there are no tabs), saying so.
 */
export async function endSharing(fileId: string): Promise<void> {
  if (!isSharing(fileId)) return;
  await stopSharing();
  toast({ title: t("hostedStopped.title"), description: t("hostedStopped.description") });
}
