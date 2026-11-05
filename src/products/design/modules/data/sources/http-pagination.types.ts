import type { DataRow } from "../table";

/** How a link's rows come in pieces: all at once, by page number, by offset, or by a "next" link. */
export type HttpPagination = "none" | "page" | "offset" | "next";

/** A link's paging settings, read with defaults. */
export interface PagingSettings {
  mode: HttpPagination;
  /** The query parameter holding the page number (`page`) or the offset (`offset`). */
  pageParam: string;
  /** The query parameter holding how many rows a page has (offset paging); `""` for none. */
  sizeParam: string;
  pageSize: number;
  /** The number of the first page (page paging): 1, or 0 for an API that counts from 0. */
  firstPage: number;
  /** Where the response holds the next page's link (`next` paging). */
  nextPath: string;
  maxPages: number;
}

/** What `fetchPages` needs besides the settings. */
export interface FetchPagesInput {
  /** The first page's link, without the paging parameters it will add. */
  url: string;
  settings: PagingSettings;
  /** The source's "Rows come from" path: each page's rows are found with it. */
  rowsPath: string | null;
  signal: AbortSignal;
  /** Tells the user the rows stopped short (a repeated page, the page limit). */
  warn(message: string): void;
}

/** The pages' rows together, and how many pages were read. */
export interface PagedRows {
  rows: DataRow[];
  pages: number;
}
