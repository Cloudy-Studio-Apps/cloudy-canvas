import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import type { HttpClient } from "@shared/core";

/** A preview gives up after this long, so a slow site doesn't hang it. */
const TIMEOUT_MS = 10_000;

/**
 * HTTP for link previews. The desktop app fetches through Tauri (no CORS); a browser falls back to
 * `fetch`, which most sites refuse cross-origin.
 */
export const http: HttpClient = {
  async getText(url) {
    const response = await get(url);
    if (!response.ok) throw new Error(`${url} answered ${response.status}.`);
    return response.text();
  },
  async getBytes(url) {
    const response = await get(url);
    return response.ok ? new Uint8Array(await response.arrayBuffer()) : null;
  },
};

function get(url: string): Promise<Response> {
  const init: RequestInit = { signal: AbortSignal.timeout(TIMEOUT_MS) };
  return isTauri() ? tauriFetch(url, init) : fetch(url, init);
}
