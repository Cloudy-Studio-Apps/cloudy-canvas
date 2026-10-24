import { ShareHost, type ShareHostOptions } from "@canvas";
import { BUILT_IN_RELAY } from "@shared/stores/built-in-relay";
import { useRelayStatusStore } from "@shared/stores/relay-status-store";

/** How long a built-in relay found unreachable is skipped before it's tried again. */
const RETRY_AFTER_MS = 5 * 60_000;

/**
 * Starts hosting. Through the built-in relay, a session that can't come online through it is
 * started again through n0's public relays (and the link then names those), and the relay status
 * store says so; the built-in one is tried again after a while.
 */
export async function startHost(options: ShareHostOptions): Promise<ShareHost> {
  if (!BUILT_IN_RELAY || options.relay !== BUILT_IN_RELAY) return ShareHost.start(options);
  const status = useRelayStatusStore.getState();
  const skip =
    status.builtInDownSince !== null && Date.now() - status.builtInDownSince < RETRY_AFTER_MS;

  if (!skip) {
    const host = await ShareHost.start(options).catch(() => null);
    if (host?.online) {
      status.setBuiltInDown(false);
      return host;
    }
    await host?.stop();
  }
  const fallback = await ShareHost.start({ ...options, relay: null });
  // Offline altogether isn't the relay's fault: only a fallback that works says it's down.
  if (fallback.online) status.setBuiltInDown(true);
  return fallback;
}
