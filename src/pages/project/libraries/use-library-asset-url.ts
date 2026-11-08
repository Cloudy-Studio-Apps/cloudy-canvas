import { useEffect, useState } from "react";

import type { LibraryAsset } from "@canvas";
import type { LibraryHub } from "@canvas-ui";

/** A library picture's bytes as an object URL (revoked when it goes); `null` until read. */
export function useLibraryAssetUrl(
  hub: LibraryHub | null,
  libraryId: string,
  asset: LibraryAsset,
): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!hub) return;
    let cancelled = false;
    let made: string | null = null;
    hub.readAssetBytes(libraryId, asset.id).then(
      (bytes) => {
        if (cancelled) return;
        made = URL.createObjectURL(
          new Blob([bytes as Uint8Array<ArrayBuffer>], { type: asset.mime }),
        );
        setUrl(made);
      },
      () => {
        if (!cancelled) setUrl(null);
      },
    );
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
      setUrl(null);
    };
  }, [hub, libraryId, asset.id, asset.mime]);
  return url;
}
