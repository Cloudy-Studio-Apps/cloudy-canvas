import { useCallback, useSyncExternalStore } from "react";

import type { ShareHost, ShareHostOptions } from "@canvas";
import { appLifecycle } from "@platform";
import type { HostedSession } from "./host-session.types";
import { startHost } from "./start-host";

/** The one file this app shares at a time. */
let current: HostedSession | null = null;
const listeners = new Set<() => void>();

/**
 * Starts sharing a file (ending any other session first), through n0's public relays when the
 * built-in one can't be reached (`startHost`). Closing the window tells the guests the session
 * ended before it goes.
 */
export async function startSharing(fileId: string, options: ShareHostOptions): Promise<ShareHost> {
  await stopSharing();
  const host = await startHost(options);
  const releaseQuit = appLifecycle.onBeforeQuit(() => host.stop());
  current = { fileId, host, releaseQuit };
  notify();
  return host;
}

/** Ends the shared session: guests are told and disconnected. */
export async function stopSharing(): Promise<void> {
  const session = current;
  if (!session) return;
  current = null;
  notify();
  session.releaseQuit();
  await session.host.stop();
}

/** The session sharing the file with this id, `null` while it isn't shared. */
export function useHostedSession(fileId: string): ShareHost | null {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  return useSyncExternalStore(subscribe, () =>
    current && current.fileId === fileId ? current.host : null,
  );
}

/** Whether the file with this id is the one being shared now. */
export function isSharing(fileId: string): boolean {
  return current?.fileId === fileId;
}

function notify(): void {
  for (const listener of listeners) listener();
}
