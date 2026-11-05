import { t } from "../data.i18n";
import type { SettingValue } from "../source";
import { normalizeRows, parsePath, readPath } from "../table";
import { UPDATE_ERRORS } from "../update";
import type { DataRow } from "../table";
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

/** A link's paging settings (`none` when unset or unknown), with their defaults. */
export function pagingSettings(settings: Record<string, SettingValue>): PagingSettings {
  const mode = MODES.find((m) => m === settings.pagination) ?? "none";
  return {
    mode,
    pageParam: text(settings.pageParam) || (mode === "offset" ? "offset" : "page"),
    sizeParam: text(settings.sizeParam),
    pageSize: count(settings.pageSize, DEFAULT_PAGE_SIZE, 100000),
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
    const start = Number(url.searchParams.get(paging.pageParam));
    url.searchParams.set(paging.pageParam, String((start >= 1 ? start : 1) + index));
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
 * before (a site that ignores the page setting) and the page limit. Stops between pages when
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
  while (link !== null) {
    signal.throwIfAborted();
    if (seen.has(link)) {
      input.warn(t("paging.repeated", { pages }));
      break;
    }
    if (pages >= paging.maxPages) {
      input.warn(t("paging.limit", { pages }));
      break;
    }
    seen.add(link);
    const page = await fetchOne(link);
    signal.throwIfAborted();
    const list = normalizeRows(page, input.rowsPath);
    if (!list) throw new Error(`${UPDATE_ERRORS.noList}${input.rowsPath ?? ""}`);
    // With no rows path, a response without a list reads as one row (itself): after the first
    // page that is the end ({ "results": [] }), not a row.
    const ended = list.length === 0 || (pages > 0 && list.length === 1 && list[0] === page);
    if (ended) break;
    pages++;
    const fingerprint = JSON.stringify(list);
    if (fingerprint === before) {
      input.warn(t("paging.same", { pages }));
      break;
    }
    before = fingerprint;
    for (const row of list) rows.push(row);
    if (paging.mode === "next") link = nextLink(page, paging, link);
    else link = pageUrl(input.url, paging, pages, rows.length);
  }
  return { rows, pages };
}

/**
 * The pages' rows placed where `rowsPath` says (`data.items` gives `{ "data": { "items": rows } }`),
 * so reading the combined result with the same "Rows come from" path finds them and the path is
 * not applied to anything else. Without a path, the rows themselves.
 */
export function placeRows(rows: DataRow[], rowsPath: string | null): unknown {
  if (rowsPath === null || rowsPath === "") return rows;
  let value: unknown = rows;
  for (const step of parsePath(rowsPath).reverse()) {
    value = "index" in step ? Object.assign([], { [step.index]: value }) : { [step.key]: value };
  }
  return value;
}
