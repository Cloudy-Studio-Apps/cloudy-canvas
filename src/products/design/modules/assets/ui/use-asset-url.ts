import { useEffect, useState } from "react";

import type { AssetActions, AssetRef } from "./assets-ui.types";

/** An object URL showing a picture (`null` while it's read or when it can't be), freed after. */
export function useAssetUrl(ref: AssetRef, actions: AssetActions): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const { asset } = ref;
  useEffect(() => {
    let made: string | null = null;
    let cancelled = false;
    actions.bytesOf(ref).then(
      (bytes) => {
        if (cancelled) return;
        made = URL.createObjectURL(
          new Blob([bytes as Uint8Array<ArrayBuffer>], { type: asset.mime }),
        );
        setUrl(made);
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
    // The bytes of a picture never change under its id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.id, asset.mime, ref.source.libraryId]);
  return url;
}
