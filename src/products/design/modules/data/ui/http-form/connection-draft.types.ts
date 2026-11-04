import type { HttpAuth, HttpBodyKind } from "../../sources";
import type { JsonRow } from "./json-body.types";
import type { PairRow } from "./pair-row.types";

/** How the JSON body is edited: as rows of names and values, or written as code. */
export type JsonMode = "rows" | "code";

/**
 * A link's settings as the Connection dialog edits them. Secrets typed are kept here until
 * saved; an empty one keeps what this device has.
 */
export interface ConnectionDraft {
  url: string;
  /** The link's settings after `?`, as rows (kept in step with `url`). */
  params: PairRow[];
  method: "GET" | "POST";
  auth: HttpAuth;
  apiKeyName: string;
  apiKeyIn: "header" | "query";
  apiKey: string;
  token: string;
  username: string;
  password: string;
  /** Plain and private headers together (`secret` says which). */
  headers: PairRow[];
  bodyKind: HttpBodyKind;
  form: PairRow[];
  /** The body as text (JSON written as code, or text). */
  body: string;
  /** A JSON body built from rows (`jsonMode` `"rows"`). */
  jsonRows: JsonRow[];
  jsonMode: JsonMode;
}
