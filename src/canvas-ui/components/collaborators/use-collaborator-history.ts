import { useCallback, useMemo, useSyncExternalStore } from "react";

import { canUndoFor, type Collaborator } from "@shared/core";
import { useEngine } from "../../engine-context";
import type { CollaboratorHistory } from "./use-collaborator-history.types";

const NO_SUBSCRIPTION = () => () => undefined;

/**
 * A collaborator's undo history, when the user may step through it (`canUndoFor`: agents) and it
 * works on this file (its workspace is here); `null` otherwise. Re-read as the history changes.
 */
export function useCollaboratorHistory(
  collaborator: Collaborator | null,
): CollaboratorHistory | null {
  const engine = useEngine();
  const allowed = collaborator !== null && canUndoFor(collaborator);
  const history = allowed ? (engine.findWorkspace(collaborator.id)?.history ?? null) : null;
  const subscribe = useCallback(
    (listener: () => void) => (history ? history.onChange(listener) : NO_SUBSCRIPTION()),
    [history],
  );
  // One string, so the snapshot only changes when something shown does.
  const key = useSyncExternalStore(subscribe, () =>
    history
      ? JSON.stringify([
          history.canUndo(),
          history.canRedo(),
          history.undoLabel(),
          history.redoLabel(),
        ])
      : "",
  );
  return useMemo(() => {
    if (!history) return null;
    const [canUndo, canRedo, undoLabel, redoLabel] = JSON.parse(key) as [
      boolean,
      boolean,
      string | null,
      string | null,
    ];
    return {
      history,
      canUndo,
      canRedo,
      undoLabel,
      redoLabel,
      undo: () => history.undo(),
      redo: () => history.redo(),
    };
  }, [history, key]);
}
