import { t } from "../data.i18n";
import type { DataSourceType } from "../data.points.types";
import { withoutExtension } from "../settings";
import { answeredMessage } from "../update";
import { buildHttpRequest } from "./http-request";
import { firstPageUrl, fetchPages, pagingSettings, placeRows } from "./http-pagination";
import { httpSettings } from "./http-settings";

function textSetting(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function lastSegment(url: string): string | undefined {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).pop();
  } catch {
    return undefined;
  }
}

/** A path segment as text (`%20` as a space); kept as it is when it isn't valid. */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * A link (a REST endpoint, a published sheet, a raw file): its headers, sign-in and body are
 * built by `buildHttpRequest`.
 */
export const HTTP_SOURCE: DataSourceType = {
  id: "http",
  get label() {
    return t("sources.http.label");
  },
  icon: "Globe",
  get settings() {
    return httpSettings();
  },
  defaultName(settings) {
    const url = textSetting(settings.url).trim();
    if (!url) return t("sources.http.label");
    try {
      const parsed = new URL(url);
      const last = parsed.pathname.split("/").filter(Boolean).pop();
      return last ? withoutExtension(decodeSegment(last)) : parsed.host;
    } catch {
      return url;
    }
  },
  /** Header values go only to the origin they were entered for. */
  secretOrigin(settings) {
    try {
      const { origin } = new URL(textSetting(settings.url).trim());
      return origin === "null" ? null : origin;
    } catch {
      return null;
    }
  },
  async update(settings, ctx) {
    const url = textSetting(settings.url).trim();
    if (!url) throw new Error("No URL.");
    const paging = pagingSettings(settings);
    // One request to `at`, with the link's headers and sign-in (every page gets them).
    const get = async (at: string) => {
      const request = buildHttpRequest({ ...settings, url: at }, ctx.secrets);
      const res = await ctx.services.http.request({ ...request, signal: ctx.signal });
      if (!res.ok) throw new Error(answeredMessage(at, res.status));
      return res;
    };
    if (paging.mode === "none" || ctx.preview) {
      // Try it reads only the first page, and says so.
      if (paging.mode !== "none") ctx.warn(t("paging.firstOnly"));
      const res = await get(firstPageUrl(url, paging));
      return { bytes: res.bytes, mime: res.headers["content-type"], fileName: lastSegment(url) };
    }
    const { rows } = await fetchPages(
      { url, settings: paging, rowsPath: ctx.rowsPath, signal: ctx.signal, warn: ctx.warn },
      async (at) => {
        const res = await get(at);
        try {
          return JSON.parse(new TextDecoder().decode(res.bytes)) as unknown;
        } catch {
          throw new Error(t("paging.notJson", { url: at }));
        }
      },
    );
    // JSON again, with the rows where "Rows come from" looks, so the pipeline reads them as it
    // reads any response (the path is applied once, to the combined rows).
    return {
      text: JSON.stringify(placeRows(rows, ctx.rowsPath)),
      mime: "application/json",
      fileName: lastSegment(url),
    };
  },
};
