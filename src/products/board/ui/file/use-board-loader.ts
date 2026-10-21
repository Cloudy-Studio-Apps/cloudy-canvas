import { useEffect, useState } from "react";

import { boardKinds, decodeBoardFile } from "@board";
import { CanvasDocument } from "@canvas";
import { storage } from "@platform";
import type { BoardLoadState } from "./use-board-loader.types";

/**
 * Loads the board with this id from storage, or starts an empty one when the id isn't a saved file
 * (a board just created from Home). The document is destroyed on unmount.
 */
export function useBoardLoader(id: string): BoardLoadState {
  const [state, setState] = useState<BoardLoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    let loaded: CanvasDocument | null = null;

    void (async () => {
      try {
        const info = await storage.get(id);
        const document = info
          ? CanvasDocument.fromUpdate(boardKinds, decodeBoardFile(await storage.load(id)))
          : new CanvasDocument(boardKinds);
        if (!active) return document.destroy();
        loaded = document;
        setState({ status: "ready", document, info });
      } catch (error) {
        console.error("[board] Failed to open the board:", error);
        if (active) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "The board couldn't be opened.",
          });
        }
      }
    })();

    return () => {
      active = false;
      loaded?.destroy();
    };
  }, [id]);

  return state;
}
