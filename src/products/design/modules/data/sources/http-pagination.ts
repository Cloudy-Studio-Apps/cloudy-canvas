import type { SettingValue } from "../source";
import { normalizeRows, readPath } from "../table";
import { UPDATE_ERRORS } from "../update";
import type { DataRow } from "../table";
import { pagingMessage } from "./paging-messages";
import type {
  FetchPagesInput,
  HttpPagination,
  PagedRows,
  PagingSettings,
} from "./http-pagination.types";

const MODES: readonly HttpPagination[] = ["none", "page", "offset", "next"];

/** The page limit when none is set. */
export const DEFAULT_MAX_PAGES = 50;
const MAX_PAGES_LIMIT = 500;
const DEFAULT_PAGE_SIZE = 100;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const count = (value: unknown, fallback: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(1, Math.floor(value)))
    : fallback;
const whole = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;

/** A link's paging settings (`none` when unset or unknown), with their defaults. */
export function pagingSettings(settings: Record<string, SettingValue>): PagingSettings {
  const mode = MODES.find((m) => m === settings.pagination) ?? "none";
  return {
    mode,
    pageParam: text(settings.pageParam) || (mode === "offset" ? "offset" : "page"),
    sizeParam: text(settings.sizeParam),
    pageSize: count(settings.pageSize, DEFAULT_PAGE_SIZE, 100000),
    firstPage: whole(settings.firstPage, 1),
    nextPath: text(settings.nextPath),
    maxPages: count(settings.maxPages, DEFAULT_MAX_PAGES, MAX_PAGES_LIMIT),
  };
}

/** The link of the first page: `url` with the page (or offset and size) settings paging adds. */
export function firstPageUrl(url: string, paging: PagingSettings): string {
  return paging.mode === "page" || paging.mode === "offset" ? pageUrl(url, paging, 0, 0) : url;
}

/** The link of page `index` (0-based) for page and offset paging; the first for `index` 0. */
function pageUrl(base: string, paging: PagingSettings, index: number, offset: number): string {
  const url = new URL(base);
  if (paging.mode === "page") {
    // A whole number already in the link is where it starts; otherwise the `firstPage` setting.
    const given = url.searchParams.get(paging.pageParam) ?? "";
    const start = /^\d+$/.test(given) ? Number(given) : paging.firstPage;
    url.searchParams.set(paging.pageParam, String(start + index));
  } else {
    if (paging.sizeParam) url.searchParams.set(paging.sizeParam, String(paging.pageSize));
    url.searchParams.set(paging.pageParam, String(offset));
  }
  return url.toString();
}

/** The link the response names as the next page, or `null` when it names none. */
function nextLink(page: unknown, paging: PagingSettings, current: string): string | null {
  const value = readPath(page, paging.nextPath);
  if (typeof value !== "string" || value.trim() === "") return null;
  return new URL(value.trim(), current).toString();
}

/**
 * Reads a link's pages one after another and puts their rows together. The first page is
 * `input.url` as it is; the next by page number, offset, or the "next" link the last response
 * names. Each page's rows are found as a single response's are (`rowsPath`, else the first list).
 * It ends on an empty page or (`next`) a response without a next link, and stops, keeping the rows
 * it has and saying so with `warn`, on a link it already read, a page with the same rows as the one
 * before (a site that ignores the page setting) and the page limit. By page number or offset, a
 * page shorter than the first (or than `pageSize`) is the last. Messages are English (`pagingMessage`),
 * translated where they are shown. Stops between pages when
 * `signal` aborts.
 */
export async function fetchPages(
  input: FetchPagesInput,
  fetchOne: (url: string) => Promise<unknown>,
): Promise<PagedRows> {
  const { settings: paging, signal } = input;
  const rows: DataRow[] = [];
  const seen = new Set<string>();
  let link: string | null = firstPageUrl(input.url, paging);
  let before: string | null = null;
  let pages = 0;
  let firstLength = 0;
  // Secrets go only to the first link's site: a next link elsewhere ends the reading.
  const origin = new URL(input.url).origin;
  while (link !== null) {
    signal.throwIfAborted();
    if (seen.has(link)) {
      input.warn(pagingMessage("repeated", { pages }));
      break;
    }
    if (pages >= paging.maxPages) {
      input.warn(pagingMessage("limit", { pages }));
      break;
    }
    seen.add(link);
    let page: unknown;
    let list: DataRow[];
    try {
      page = await fetchOne(link);
      signal.throwIfAborted();
      const found = normalizeRows(page, input.rowsPath);
      if (!found) throw new Error(`${UPDATE_ERRORS.noList}${input.rowsPath ?? ""}`);
      list = found;
    } catch (error) {
      // The first page failing fails the Update; a later one keeps the rows read, with a warning.
      if (pages === 0 || signal.aborted) throw error;
      const message = error instanceof Error ? error.message : String(error);
      input.warn(pagingMessage("failed", { page: pages + 1, message }));
      break;
    }
    // With no rows path, a response without a list reads as one row (itself): after the first
    // page that is the end ({ "results": [] }), not a row.
    const ended = list.length === 0 || (pages > 0 && list.length === 1 && list[0] === page);
    if (ended) break;
    const fingerprint = JSON.stringify(list);
    if (fingerprint === before) {
      input.warn(pagingMessage("same", { pages }));
      break;
    }
    pages++;
    before = fingerprint;
    for (const row of list) rows.push(row);
    if (pages === 1) firstLength = list.length;
    // By page number or offset a page with fewer rows than a full one is the last: no more pages
    // to ask for (and no limit warning when it came exactly at the limit).
    const fullPage = paging.mode === "offset" && paging.sizeParam ? paging.pageSize : firstLength;
    if (paging.mode !== "next" && list.length < fullPage) break;
    if (paging.mode === "next") {
      link = nextLink(page, paging, link);
      if (link !== null && new URL(link).origin !== origin) {
        input.warn(pagingMessage("otherSite", { pages }));
        break;
      }
    } else link = pageUrl(input.url, paging, pages, rows.length);
  }
  return { rows, pages };
}
