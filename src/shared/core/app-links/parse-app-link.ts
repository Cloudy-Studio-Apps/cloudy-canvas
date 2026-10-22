import { isFileType } from "../files";
import type { AppLink, AppLinkPage } from "./app-links.types";

/** The scheme registered with the OS (`plugins.deep-link` in `tauri.conf.json`). */
export const APP_LINK_SCHEME = "cloudy-canvas";

const PAGES: readonly AppLinkPage[] = ["home", "settings"];

/** Reads a `cloudy-canvas://` link, or `null` when it isn't one or asks for nothing known. */
export function parseAppLink(link: string): AppLink | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== `${APP_LINK_SCHEME}:`) return null;

  // `cloudy-canvas://board/<id>` reads as host "board" and path "/<id>".
  const [head, ...rest] = [url.hostname, ...url.pathname.split("/")]
    .map((part) => decodeURIComponent(part))
    .filter((part) => part !== "");
  const arg = rest[0];

  if (head === "open") {
    const path = url.searchParams.get("path");
    return path ? { action: "open", path } : null;
  }
  if (head === "new") return isFileType(arg) ? { action: "new", type: arg } : null;
  if (isFileType(head)) return arg ? { action: "show", type: head, id: arg } : null;
  if (head === undefined) return { action: "page", page: "home" };
  const page = PAGES.find((p) => p === head);
  return page ? { action: "page", page } : null;
}
