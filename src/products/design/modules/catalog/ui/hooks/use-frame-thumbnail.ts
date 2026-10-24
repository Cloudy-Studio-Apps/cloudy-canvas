import { useEffect, useSyncExternalStore } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { frameThumbnailsOf } from "../thumbnails/frame-thumbnails";

/** A small picture of a page frame, or `null` until it's drawn; it follows the frame's changes. */
export function useFrameThumbnail(frameId: string): string | null {
  const thumbnails = frameThumbnailsOf(useDesignEngine());
  const url = useSyncExternalStore(thumbnails.subscribe, () => thumbnails.url(frameId));
  useEffect(() => thumbnails.request(frameId), [thumbnails, frameId, url]);
  return url;
}
