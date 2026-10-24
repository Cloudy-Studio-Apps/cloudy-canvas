import { useEffect, useState } from "react";

import type { CanvasDocument } from "@canvas";
import { storage } from "@platform";
import type { CanvasFileLoadState, CanvasFileSource } from "./canvas-file.types";

/**
 * Loads the file with this id from storage, or starts an empty document when the id isn't a saved
 * file (one just created from Home), or takes a live session's document (`source.live`). The
 * document is destroyed on unmount. `source` is read once per id.
 */
export function useCanvasFileLoader(id: string, source: CanvasFileSource): CanvasFileLoadState {
  const [state, setState] = useState<CanvasFileLoadState>({ status: "loading" });
  const [initialSource] = useState(source);

  useEffect(() => {
    let active = true;
    let loaded: CanvasDocument | null = null;
    const { noun, open, create, live } = initialSource;

    void (async () => {
      try {
        if (live) {
          const document = live();
          loaded = document;
          setState({ status: "ready", document, info: null });
          return;
        }
        const info = await storage.get(id);
        const document = info ? open(await storage.load(id)) : create();
        if (!active) return document.destroy();
        loaded = document;
        setState({ status: "ready", document, info });
      } catch (error) {
        console.error(`[${noun}] Failed to open the file:`, error);
        if (active) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : `The ${noun} couldn't be opened.`,
          });
        }
      }
    })();

    return () => {
      active = false;
      loaded?.destroy();
    };
  }, [id, initialSource]);

  return state;
}
