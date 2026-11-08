import { DOCUMENT_TOKENS } from "@canvas";
import { useDocumentTokens, useTokenEditable, useTokenSources } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { boardAxis, boardModes } from "./board-modes";
import type { UseBoard } from "./use-board.types";
import { useVariablesWindowStore } from "./variables-window-store";

/**
 * What every piece of the window reads: the tokens, the collection, the axis and its modes, and
 * whether they can be edited (a library's only while the project's libraries are open).
 */
export function useBoard(): UseBoard {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const { collectionId, axisId, view } = useVariablesWindowStore();
  const collection =
    (collectionId ? store.collection(collectionId) : undefined) ?? store.collections()[0];
  const axis = boardAxis(store, axisId);
  const modes = boardModes(axis);
  const shown = view === "all" ? modes : modes.filter((m) => m.id === view);
  const canEdit = useTokenEditable();
  const source = useTokenSources(collection ? [collection] : [])?.[0] ?? null;
  return {
    engine,
    tokens: engine.service(DOCUMENT_TOKENS),
    store,
    collection,
    axis,
    modes,
    shown: shown.length > 0 ? shown : modes,
    source,
    editable: collection === undefined || canEdit(collection),
    canEdit,
  };
}
