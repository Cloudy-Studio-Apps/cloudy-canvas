import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import type { HttpClient, HttpRequest, HttpResponse } from "@shared/core";

/** A preview gives up after this long, so a slow site doesn't hang it. */
const TIMEOUT_MS = 10_000;
/** A data request gives up after this long unless it says otherwise. */
const REQUEST_TIMEOUT_MS = 30_000;

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
  async request(req): Promise<HttpResponse> {
    const response = await send(req);
    const headers: Record<string, string> = {};
    response.headers.forEach((value, name) => {
      headers[name.toLowerCase()] = value;
    });
    return {
      status: response.status,
      ok: response.ok,
      headers,
      bytes: new Uint8Array(await response.arrayBuffer()),
    };
  },
};

function get(url: string): Promise<Response> {
  const init: RequestInit = { signal: AbortSignal.timeout(TIMEOUT_MS) };
  return isTauri() ? tauriFetch(url, init) : fetch(url, init);
}

function send(req: HttpRequest): Promise<Response> {
  const timeout = AbortSignal.timeout(req.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const init: RequestInit = {
    method: req.method ?? "GET",
    headers: req.headers,
    body: req.body,
    signal: req.signal ? AbortSignal.any([timeout, req.signal]) : timeout,
  };
  return isTauri() ? tauriFetch(req.url, init) : fetch(req.url, init);
}
