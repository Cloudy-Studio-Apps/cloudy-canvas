import { useEffect, useSyncExternalStore } from "react";

import { useEngine } from "../engine-context";
import { elementThumbnailsOf } from "./element-thumbnails";

/**
 * A small picture of a top-level element, or `null` until it's drawn; it follows the element's
 * changes.
 */
export function useElementThumbnail(id: string): string | null {
  const thumbnails = elementThumbnailsOf(useEngine());
  const url = useSyncExternalStore(thumbnails.subscribe, () => thumbnails.url(id));
  useEffect(() => thumbnails.request(id), [thumbnails, id, url]);
  return url;
}
