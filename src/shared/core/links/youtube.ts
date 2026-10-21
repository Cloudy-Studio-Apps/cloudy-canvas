import type { YoutubeVideo } from "./links.types";

const YOUTUBE_HOSTS = new Set(["youtube.com", "m.youtube.com", "music.youtube.com"]);
const ID = /^[\w-]{11}$/;

/** The video a YouTube link points at (watch, youtu.be, shorts, live or embed links), or `null`. */
export function youtubeVideo(url: URL): YoutubeVideo | null {
  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const [first, second] = url.pathname.split("/").filter(Boolean);
    if (first === "watch") id = url.searchParams.get("v");
    else if (first === "shorts" || first === "live" || first === "embed") id = second ?? null;
  }
  if (!id || !ID.test(id)) return null;
  return { id, start: startSeconds(url.searchParams.get("t") ?? url.searchParams.get("start")) };
}

/** The privacy-friendly player for a video, starting playback right away. */
export function youtubeEmbedUrl(video: YoutubeVideo): string {
  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (video.start > 0) params.set("start", String(video.start));
  return `https://www.youtube-nocookie.com/embed/${video.id}?${params.toString()}`;
}

/** Thumbnails to try, best first (the large one doesn't exist for every video). */
export function youtubeThumbnailUrls(id: string): string[] {
  return [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  ];
}

/** "90", "90s", "1m30s" or "1h2m3s" in seconds. */
function startSeconds(value: string | null): number {
  if (!value) return 0;
  if (/^\d+s?$/.test(value)) return parseInt(value, 10);
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  if (!match) return 0;
  const [, h = "0", m = "0", s = "0"] = match;
  return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10);
}
