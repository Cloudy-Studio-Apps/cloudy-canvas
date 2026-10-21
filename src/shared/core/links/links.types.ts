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

/**
 * Plain HTTP GETs that aren't limited to the app's origin (desktop: Tauri's HTTP plugin).
 * Implemented per platform in `platform/`.
 */
export interface HttpClient {
  /** The body as text. Throws on network errors and non-2xx responses. */
  getText(url: string): Promise<string>;
  /** The body as bytes, or `null` on a non-2xx response. Throws on network errors. */
  getBytes(url: string): Promise<Uint8Array | null>;
}
