import { useEffect, useState } from "react";

import { projectFs } from "@platform";
import { imageTypeFromName, joinRelative, projectPaths } from "@shared/core";
import type { ImageBytes } from "./use-project-image.types";

/** An object URL for image bytes, or `null` for none; released when the image changes. */
export function useImageUrl(image: ImageBytes | null): string | null {
  const [made, setMade] = useState<{ image: ImageBytes; url: string } | null>(null);
  useEffect(() => {
    if (!image) return;
    let url: string | null = null;
    let cancelled = false;
    // Made after the effect, so the state is set from a callback.
    queueMicrotask(() => {
      if (cancelled) return;
      url = URL.createObjectURL(
        new Blob([image.data as Uint8Array<ArrayBuffer>], { type: image.type }),
      );
      setMade({ image, url });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [image]);
  return image && made?.image === image ? made.url : null;
}

/**
 * A URL for an image kept in a project's data folder (its icon or cover) by file name, or `null`
 * when there is none or it can't be read. `rev` reloads it after the file was replaced.
 */
export function useProjectImage(root: string, file: string | null, rev = 0): string | null {
  const [loaded, setLoaded] = useState<{ file: string; image: ImageBytes | null } | null>(null);
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    projectFs.readBytes(joinRelative(projectPaths(root).data, file)).then(
      (data) => {
        if (!cancelled)
          setLoaded({ file, image: { data, type: imageTypeFromName(file) ?? "image/png" } });
      },
      () => {
        if (!cancelled) setLoaded({ file, image: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [root, file, rev]);
  return useImageUrl(file && loaded?.file === file ? loaded.image : null);
}
