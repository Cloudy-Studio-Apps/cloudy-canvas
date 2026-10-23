import { useEffect, useMemo } from "react";

import { useEngine } from "./engine-context";

/** A URL showing a document asset (an image) in the DOM, or `null` without one. */
export function useAssetUrl(assetId: string | null): string | null {
  const engine = useEngine();
  const url = useMemo(() => {
    const data = assetId ? engine.doc.getAsset(assetId) : undefined;
    if (!data) return null;
    // SVGs only show with their type; other images are recognized from their bytes.
    const isSvg = new TextDecoder().decode(data.subarray(0, 256)).includes("<svg");
    const blob = new Blob(
      [data as Uint8Array<ArrayBuffer>],
      isSvg ? { type: "image/svg+xml" } : {},
    );
    return URL.createObjectURL(blob);
  }, [engine, assetId]);

  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return url;
}
