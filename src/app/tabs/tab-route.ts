import { matchPath } from "react-router";

import type { FileTab } from "@canvas/tabs";
import type { FileType } from "@shared/core";
import type { FileRoute } from "./tab-route.types";

const FILE_TYPES: readonly FileType[] = ["board", "design"];

/** The file a route opens (`/board/<id>`, `/design/<id>`), `null` for any other route. */
export function fileRouteOf(pathname: string): FileRoute | null {
  for (const type of FILE_TYPES) {
    const id = matchPath(`/${type}/:id`, pathname)?.params.id;
    if (id) return { type, id };
  }
  return null;
}

/** The route that shows a tab (its params were only read when it opened). */
export function tabRoute(tab: FileTab): string {
  return `/${tab.type}/${encodeURIComponent(tab.fileId)}`;
}
