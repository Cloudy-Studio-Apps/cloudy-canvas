import { DOCUMENT_TOKENS } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { boardAxis, boardModes } from "./board-modes";
import type { UseBoard } from "./use-board.types";
import { useVariablesWindowStore } from "./variables-window-store";

/** What every piece of the window reads: the tokens, the collection, the axis and its modes. */
export function useBoard(): UseBoard {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const { collectionId, axisId, view } = useVariablesWindowStore();
  const collection =
    (collectionId ? store.collection(collectionId) : undefined) ?? store.collections()[0];
  const axis = boardAxis(store, axisId);
  const modes = boardModes(axis);
  const shown = view === "all" ? modes : modes.filter((m) => m.id === view);
  return {
    engine,
    tokens: engine.service(DOCUMENT_TOKENS),
    store,
    collection,
    axis,
    modes,
    shown: shown.length > 0 ? shown : modes,
  };
}
