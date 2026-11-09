import { useEffect, useState } from "react";

import type { CanvasDocument, ShareGuest } from "@canvas";
import type { CanvasFileLoadState, CanvasFileSource } from "./canvas-file.types";
import { loadCanvasFile } from "./load-canvas-file";

/**
 * `loadCanvasFile` for a host that isn't a file tab (the editors take their document from their
 * tab): loads once per id and destroys the document on unmount. `source` and `live` are read once
 * per id.
 */
export function useCanvasFileLoader(
  id: string,
  source: CanvasFileSource,
  live: ShareGuest | null = null,
): CanvasFileLoadState {
  const [state, setState] = useState<CanvasFileLoadState>({ status: "loading" });
  const [initial] = useState(() => ({ source, live }));

  useEffect(() => {
    let active = true;
    let loaded: CanvasDocument | null = null;
    loadCanvasFile(id, initial.source, initial.live).then(
      ({ document, info }) => {
        if (!active) return document.destroy();
        loaded = document;
        setState({ status: "ready", document, info });
      },
      (error: unknown) => {
        if (active) setState({ status: "error", message: (error as Error).message });
      },
    );
    return () => {
      active = false;
      loaded?.destroy();
    };
  }, [id, initial]);

  return state;
}
