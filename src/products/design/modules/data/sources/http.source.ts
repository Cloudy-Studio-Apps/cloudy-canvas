import { t } from "../data.i18n";
import type { DataSourceType } from "../data.points.types";
import { withoutExtension } from "../settings";
import { answeredMessage } from "../update";

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

/** A link (a REST endpoint, a published sheet, a raw file). */
export const HTTP_SOURCE: DataSourceType = {
  id: "http",
  get label() {
    return t("sources.http.label");
  },
  icon: "Globe",
  get settings() {
    return [
      { key: "url", kind: "url" as const, label: t("sources.http.url"), required: true },
      {
        key: "method",
        kind: "select" as const,
        label: t("sources.http.method"),
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
        ],
      },
      {
        key: "headers",
        kind: "pairs" as const,
        label: t("sources.http.headers"),
        secretValues: true,
      },
      { key: "body", kind: "multiline" as const, label: t("sources.http.body") },
    ];
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
    const stored = settings.headers && typeof settings.headers === "object" ? settings.headers : {};
    const headers: Record<string, string> = {};
    for (const [name, value] of Object.entries(stored)) {
      headers[name] = ctx.secrets[`headers.${name}`] ?? value;
    }
    const method = settings.method === "POST" ? "POST" : "GET";
    const body = textSetting(settings.body);
    const res = await ctx.services.http.request({
      url,
      method,
      headers,
      body: method === "POST" && body !== "" ? body : undefined,
      signal: ctx.signal,
    });
    if (!res.ok) throw new Error(answeredMessage(url, res.status));
    return { bytes: res.bytes, mime: res.headers["content-type"], fileName: lastSegment(url) };
  },
};
