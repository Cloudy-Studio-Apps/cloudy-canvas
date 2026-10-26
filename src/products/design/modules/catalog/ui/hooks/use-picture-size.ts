import { useEffect, useState } from "react";

import type { Size } from "@canvas";
import { knownPictureSize, pictureSize } from "../../checks/picture-size";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** A picture asset's natural size, `null` until it's read (or when it can't be). */
export function usePictureSize(assetId: string): Size | null {
  const { doc } = useDesignEngine();
  const [size, setSize] = useState(() => knownPictureSize(doc, assetId) ?? null);
  useEffect(() => {
    let current = true;
    void pictureSize(doc, assetId).then((read) => current && setSize(read));
    return () => {
      current = false;
    };
  }, [doc, assetId]);
  return size;
}
