import { useEffect, useState } from "react";

import type { AssetActions, AssetRef, AssetUrl } from "./assets-ui.types";

/**
 * An object URL showing a picture (`url` is `null` while it's read), freed after; `failed` when
 * its bytes couldn't be read, for a broken-picture state.
 */
export function useAssetUrl(ref: AssetRef, actions: AssetActions): AssetUrl {
  const [state, setState] = useState<AssetUrl>({ url: null, failed: false });
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
        setState({ url: made, failed: false });
      },
      () => !cancelled && setState({ url: null, failed: true }),
    );
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
    // The bytes of a picture never change under its id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.id, asset.mime, ref.source.libraryId]);
  return state;
}
