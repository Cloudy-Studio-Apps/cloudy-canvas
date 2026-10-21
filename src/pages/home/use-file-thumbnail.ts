import { useEffect, useState } from "react";

import { storage } from "@platform";
import { useThumbnailStore } from "@shared/stores/thumbnail-store";

/**
 * A URL for the file's preview picture, or `null` while it loads or when it has none. Reloads
 * when a new one is written.
 */
export function useFileThumbnail(id: string): string | null {
  const version = useThumbnailStore((state) => state.versions[id] ?? 0);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let created: string | null = null;
    void (async () => {
      try {
        const image = await storage.loadThumbnail(id);
        if (!active) return;
        created = image
          ? URL.createObjectURL(
              new Blob([image as Uint8Array<ArrayBuffer>], { type: "image/jpeg" }),
            )
          : null;
        setUrl(created);
      } catch {
        // No preview: the card shows its icon.
        if (active) setUrl(null);
      }
    })();
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [id, version]);

  return url;
}
