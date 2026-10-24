import { APP_LINK_SCHEME } from "../app-links";
import type { ShareTicket } from "./share-link.types";
import type { RelaySettings } from "./share-transport.types";

const LINK_PREFIX = `${APP_LINK_SCHEME}://join/`;
const TICKET_VERSION = 1;

/** `cloudy-canvas://join/<ticket>`: what the host copies and guests open. */
export function shareLink(ticket: ShareTicket): string {
  return LINK_PREFIX + encodeShareTicket(ticket);
}

/** The ticket as URL-safe text: base64url of its JSON. */
export function encodeShareTicket(ticket: ShareTicket): string {
  const json = JSON.stringify({ v: TICKET_VERSION, ...ticket });
  return toBase64Url(new TextEncoder().encode(json));
}

/**
 * The ticket in a link, or in the ticket text alone (pasted from a message, maybe with spaces
 * around it); `null` when it isn't one.
 */
export function readShareTicket(text: string): ShareTicket | null {
  const trimmed = text.trim();
  const encoded = trimmed.startsWith(LINK_PREFIX) ? trimmed.slice(LINK_PREFIX.length) : trimmed;
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded.replace(/\/+$/, ""))));
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const { v, addr, relay, secret } = value as Record<string, unknown>;
  if (v !== TICKET_VERSION || typeof secret !== "string" || !secret || addr == null) return null;
  return { addr, relay: readRelay(relay), secret };
}

/** A new session secret: 32 random bytes as base64url. */
export function createShareSecret(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

function readRelay(value: unknown): RelaySettings | null {
  if (typeof value !== "object" || value === null) return null;
  const { url, token } = value as Record<string, unknown>;
  if (typeof url !== "string" || !url) return null;
  return { url, token: typeof token === "string" && token ? token : null };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
