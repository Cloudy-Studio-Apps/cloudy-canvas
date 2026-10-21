/** The text as an http(s) URL when it's a single link (nothing else around it), else `null`. */
export function parseWebUrl(text: string): URL | null {
  const value = text.trim();
  if (!value || /\s/.test(value)) return null;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".")
      ? url
      : null;
  } catch {
    return null;
  }
}

/** The host without `www.`, e.g. "github.com". */
export function displayHost(url: URL): string {
  return url.hostname.replace(/^www\./, "");
}
