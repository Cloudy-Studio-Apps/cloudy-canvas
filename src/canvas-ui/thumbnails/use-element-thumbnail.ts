import { useEffect, useSyncExternalStore } from "react";

import { useEngine } from "../engine-context";
import { elementThumbnailsOf } from "./element-thumbnails";

/**
 * A small picture of a top-level element, or `null` until it's drawn; it follows the element's
 * changes. While `wanted` is false it isn't asked for (one already drawn is still returned).
 */
export function useElementThumbnail(id: string, wanted = true): string | null {
  const thumbnails = elementThumbnailsOf(useEngine());
  const url = useSyncExternalStore(thumbnails.subscribe, () => thumbnails.url(id));
  useEffect(() => {
    if (wanted) thumbnails.request(id);
  }, [thumbnails, id, url, wanted]);
  return url;
}
