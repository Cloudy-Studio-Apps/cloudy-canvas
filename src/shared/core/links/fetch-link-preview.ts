import { parseHtmlMeta } from "./html-meta";
import type { HttpClient, LinkPreview } from "./links.types";
import { youtubeThumbnailUrls, youtubeVideo } from "./youtube";

/** Reads what a link's card shows. YouTube videos use oEmbed; other pages their HTML. */
export async function fetchLinkPreview(http: HttpClient, url: URL): Promise<LinkPreview> {
  const video = youtubeVideo(url);
  if (video) {
    const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url.href)}`;
    const data: unknown = JSON.parse(await http.getText(oembed));
    const title = typeof data === "object" && data && "title" in data ? data.title : null;
    return {
      title: typeof title === "string" && title ? title : "YouTube video",
      siteName: "YouTube",
      imageUrls: youtubeThumbnailUrls(video.id),
    };
  }
  return parseHtmlMeta(await http.getText(url.href), url);
}

/** The first of `urls` that downloads as an image the webview can decode, or `null`. */
export async function fetchFirstImage(
  http: HttpClient,
  urls: readonly string[],
): Promise<Uint8Array | null> {
  for (const url of urls) {
    try {
      const bytes = await http.getBytes(url);
      if (bytes && (await isImage(bytes))) return bytes;
    } catch {
      // Try the next one.
    }
  }
  return null;
}

async function isImage(bytes: Uint8Array): Promise<boolean> {
  if (bytes.length === 0) return false;
  try {
    const bitmap = await createImageBitmap(new Blob([bytes as BlobPart]));
    bitmap.close();
    return true;
  } catch {
    return false;
  }
}
