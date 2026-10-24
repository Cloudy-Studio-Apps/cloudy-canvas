import type { RelaySettings } from "@shared/core";

/**
 * The relay this build was made with (`VITE_CLOUDY_RELAY_URL` and `VITE_CLOUDY_RELAY_TOKEN`, from
 * `.env.local` or the release workflow's secrets), or `null` when it was made without one.
 */
export const BUILT_IN_RELAY: RelaySettings | null = readBuiltInRelay();

function readBuiltInRelay(): RelaySettings | null {
  const url = import.meta.env.VITE_CLOUDY_RELAY_URL?.trim();
  if (!url) return null;
  return { url, token: import.meta.env.VITE_CLOUDY_RELAY_TOKEN?.trim() || null };
}
