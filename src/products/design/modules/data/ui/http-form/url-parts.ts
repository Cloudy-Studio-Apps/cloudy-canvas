import { createId } from "@shared/core";

import type { PairRow } from "./pair-row.types";
import type { UrlParts } from "./url-parts.types";

/** A link's site, path and settings (`?limit=20` as rows); `ok: false` when it isn't a link. */
export function urlParts(raw: string): UrlParts {
  try {
    const url = new URL(raw.trim());
    const params = [...url.searchParams].map(([name, value]) => ({ id: createId(), name, value }));
    return { ok: true, host: url.host, path: url.pathname, params };
  } catch {
    return { ok: false, host: "", path: raw, params: [] };
  }
}

/** The link with its settings replaced by `params` (rows without a name left out). */
export function withParams(raw: string, params: readonly PairRow[]): string {
  const [base = "", ...rest] = raw.split("#");
  const hash = rest.length > 0 ? `#${rest.join("#")}` : "";
  const path = base.split("?")[0] ?? "";
  const query = params
    .filter((p) => p.name.trim() !== "")
    .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`)
    .join("&");
  return `${path}${query ? `?${query}` : ""}${hash}`;
}
