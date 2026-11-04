/** A YouTube video a link points at. */
export interface YoutubeVideo {
  id: string;
  /** Where playback starts, in seconds (from `t=` / `start=`). */
  start: number;
}

/** What a link shows as a card: read from the page (Open Graph) or the provider's oEmbed. */
export interface LinkPreview {
  title: string;
  /** The site's name, e.g. "YouTube" (falls back to the host). */
  siteName: string;
  /** Pictures for the card (`og:image`, video thumbnails), absolute, best first. */
  imageUrls: string[];
}

/** The HTTP methods a request can use. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** A request for `HttpClient.request`. */
export interface HttpRequest {
  url: string;
  /** Defaults to `GET`. */
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  /** Gives up after this long (default 30 000). */
  timeoutMs?: number;
  /** Aborts the request when it fires. */
  signal?: AbortSignal;
}

/** What `HttpClient.request` answers, whatever the status. */
export interface HttpResponse {
  status: number;
  /** `true` for a 2xx status. */
  ok: boolean;
  /** Header names are lower-cased. */
  headers: Record<string, string>;
  bytes: Uint8Array;
}

/**
 * Plain HTTP requests that aren't limited to the app's origin (desktop: Tauri's HTTP plugin).
 * Implemented per platform in `platform/`.
 */
export interface HttpClient {
  /** The body as text. Throws on network errors and non-2xx responses. */
  getText(url: string): Promise<string>;
  /** The body as bytes, or `null` on a non-2xx response. Throws on network errors. */
  getBytes(url: string): Promise<Uint8Array | null>;
  /**
   * Any request. A non-2xx status is an answer, not an error; throws on network errors, timeout
   * and abort.
   */
  request(req: HttpRequest): Promise<HttpResponse>;
}
