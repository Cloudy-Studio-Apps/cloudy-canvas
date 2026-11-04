import { bytesToBase64 } from "@canvas";

import type { SettingValue } from "../source";
import type { HttpAuth, HttpBodyKind, HttpRequestPlan } from "./http-request.types";

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const pairs = (value: unknown): Record<string, string> =>
  value && typeof value === "object" ? (value as Record<string, string>) : {};

const AUTHS: readonly HttpAuth[] = ["none", "apikey", "bearer", "basic"];
const BODY_KINDS: readonly HttpBodyKind[] = ["none", "form", "json", "text"];
const CONTENT_TYPES: Record<Exclude<HttpBodyKind, "none">, string> = {
  form: "application/x-www-form-urlencoded",
  json: "application/json",
  text: "text/plain",
};

/** The header name an API key goes in when none is given. */
export const DEFAULT_API_KEY_NAME = "X-API-Key";

/** A link's sign-in setting (`none` when unset or unknown). */
export function httpAuth(settings: Record<string, SettingValue>): HttpAuth {
  const value = settings.auth;
  return AUTHS.find((a) => a === value) ?? "none";
}

/**
 * A link's body kind. A record from before body kinds has none: its body, when it has one, is
 * sent as written (`"raw"`), without a Content-Type, as it always was.
 */
export function httpBodyKind(settings: Record<string, SettingValue>): HttpBodyKind | "raw" {
  const value = settings.bodyKind;
  const kind = BODY_KINDS.find((k) => k === value);
  if (kind) return kind;
  return text(settings.body) !== "" ? "raw" : "none";
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === lower);
}

function setHeader(headers: Record<string, string>, name: string, value: string): void {
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) if (key.toLowerCase() === lower) delete headers[key];
  headers[name] = value;
}

function bodyOf(settings: Record<string, SettingValue>, kind: HttpBodyKind | "raw"): string {
  if (kind === "form") return new URLSearchParams(Object.entries(pairs(settings.form))).toString();
  if (kind === "none") return "";
  return text(settings.body);
}

/**
 * The request a link's settings ask for: its headers (the plain ones, then the secret ones, with
 * their values from `secrets["headers.<name>"]`), its sign-in (a header, or the key in the link)
 * and, for POST, its body with a Content-Type unless a header sets one. Throws on a bad URL.
 */
export function buildHttpRequest(
  settings: Record<string, SettingValue>,
  secrets: Record<string, string>,
): HttpRequestPlan {
  const url = new URL(text(settings.url).trim());
  const headers: Record<string, string> = { ...pairs(settings.plainHeaders) };
  for (const [name, value] of Object.entries(pairs(settings.headers))) {
    headers[name] = secrets[`headers.${name}`] ?? value;
  }
  const auth = httpAuth(settings);
  if (auth === "apikey") {
    const name = text(settings.apiKeyName).trim() || DEFAULT_API_KEY_NAME;
    const key = secrets.apiKey ?? "";
    if (settings.apiKeyIn === "query") url.searchParams.set(name, key);
    else setHeader(headers, name, key);
  } else if (auth === "bearer") {
    setHeader(headers, "Authorization", `Bearer ${secrets.token ?? ""}`);
  } else if (auth === "basic") {
    const pair = `${text(settings.username)}:${secrets.password ?? ""}`;
    setHeader(headers, "Authorization", `Basic ${bytesToBase64(new TextEncoder().encode(pair))}`);
  }
  const method = settings.method === "POST" ? "POST" : "GET";
  if (method === "GET") return { url: url.toString(), method, headers };
  const kind = httpBodyKind(settings);
  const body = bodyOf(settings, kind);
  if (kind !== "none" && kind !== "raw" && !hasHeader(headers, "content-type")) {
    headers["Content-Type"] = CONTENT_TYPES[kind];
  }
  return { url: url.toString(), method, headers, body: body !== "" ? body : undefined };
}
