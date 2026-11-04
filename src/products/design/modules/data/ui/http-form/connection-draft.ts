import { createId } from "@shared/core";

import { httpAuth, httpBodyKind } from "../../sources";
import type { SettingValue } from "../../source";
import type { ConnectionDraft } from "./connection-draft.types";
import { jsonToRows, rowsToJson } from "./json-body";
import { urlParts } from "./url-parts";
import type { PairRow } from "./pair-row.types";

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const pairs = (value: unknown): Record<string, string> =>
  value && typeof value === "object" ? (value as Record<string, string>) : {};

function rowsOf(value: unknown, secret: boolean, stored: ReadonlySet<string>): PairRow[] {
  return Object.entries(pairs(value)).map(([name, v]) => ({
    id: createId(),
    name,
    value: secret ? "" : v,
    secret,
    stored: secret && stored.has(`headers.${name}`),
  }));
}

function record(rows: readonly PairRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const name = row.name.trim();
    if (name) out[name] = row.value;
  }
  return out;
}

/** The dialog's draft from a link's settings (`stored`: the secrets this device keeps). */
export function toDraft(
  values: Record<string, SettingValue>,
  stored: ReadonlySet<string>,
): ConnectionDraft {
  const kind = httpBodyKind(values);
  const body = text(values.body);
  const jsonRows = jsonToRows(body);
  const url = text(values.url);
  return {
    url,
    params: urlParts(url).params,
    method: values.method === "POST" ? "POST" : "GET",
    auth: httpAuth(values),
    apiKeyName: text(values.apiKeyName),
    apiKeyIn: values.apiKeyIn === "query" ? "query" : "header",
    apiKey: "",
    token: "",
    username: text(values.username),
    password: "",
    headers: [
      ...rowsOf(values.plainHeaders, false, stored),
      ...rowsOf(values.headers, true, stored),
    ],
    // A body from before body kinds is shown as text, which sends it as it was.
    bodyKind: kind === "raw" ? "text" : kind,
    form: rowsOf(values.form, false, stored),
    body,
    jsonRows: jsonRows ?? [],
    jsonMode: jsonRows ? "rows" : "code",
  };
}

/**
 * The settings a draft saves: plain headers in the file, private ones' values to this device
 * (`""` keeps the stored one), typed secrets, and the body for its kind.
 */
export function fromDraft(draft: ConnectionDraft): Record<string, SettingValue> {
  return {
    url: draft.url.trim(),
    method: draft.method,
    auth: draft.auth,
    apiKeyName: draft.apiKeyName.trim(),
    apiKeyIn: draft.apiKeyIn,
    apiKey: draft.apiKey,
    token: draft.token,
    username: draft.username,
    password: draft.password,
    plainHeaders: record(draft.headers.filter((h) => !h.secret)),
    headers: record(draft.headers.filter((h) => h.secret)),
    bodyKind: draft.bodyKind,
    form: record(draft.form),
    body:
      draft.bodyKind === "json" && draft.jsonMode === "rows"
        ? rowsToJson(draft.jsonRows)
        : draft.body,
  };
}
