import { displayHost } from "./web-url";
import type { LinkPreview } from "./links.types";

/** Reads a page's title, site name and picture from its HTML (Open Graph, Twitter, `<title>`). */
export function parseHtmlMeta(html: string, pageUrl: URL): LinkPreview {
  const page = new DOMParser().parseFromString(html, "text/html");
  const meta = (...keys: string[]) => {
    for (const key of keys) {
      const content = page
        .querySelector(`meta[property="${key}"], meta[name="${key}"]`)
        ?.getAttribute("content")
        ?.trim();
      if (content) return content;
    }
    return null;
  };
  const absolute = (href: string | null | undefined) => {
    if (!href) return null;
    try {
      return new URL(href, pageUrl).href;
    } catch {
      return null;
    }
  };

  const title =
    meta("og:title", "twitter:title") ?? page.querySelector("title")?.textContent?.trim() ?? "";
  const image = absolute(meta("og:image", "og:image:url", "twitter:image"));

  return {
    title: title || displayHost(pageUrl),
    siteName: meta("og:site_name", "application-name") ?? displayHost(pageUrl),
    imageUrls: image ? [image] : [],
  };
}
