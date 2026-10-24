import type { RelaySettings } from "@shared/core";

/**
 * The relay this build was made with (`VITE_CLOUDY_RELAY_URL` and `VITE_CLOUDY_RELAY_TOKEN`, from
 * `.env.local` or the release workflow's secrets), or `null` when it was made without one.
 */
export const BUILT_IN_RELAY: RelaySettings | null = readBuiltInRelay();

/**
 * Whether the user picks the relay in Settings (development builds only). Release builds always
 * host through the built-in relay, and n0's public ones when it can't be reached.
 */
export const RELAY_CHOICE_IN_SETTINGS = import.meta.env.DEV;

function readBuiltInRelay(): RelaySettings | null {
  const url = import.meta.env.VITE_CLOUDY_RELAY_URL?.trim();
  if (!url) return null;
  return { url, token: import.meta.env.VITE_CLOUDY_RELAY_TOKEN?.trim() || null };
}
