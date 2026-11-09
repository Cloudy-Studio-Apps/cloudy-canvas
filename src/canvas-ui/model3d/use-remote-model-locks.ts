import { useEffect } from "react";

import { MODEL_EDIT_LOCKS, type CanvasEngine } from "@canvas";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";

/**
 * Feeds the engine's model edit locks with what the others have live on this file. A lock goes
 * when its collaborator does (the store drops them).
 */
export function useRemoteModelLocks(engine: CanvasEngine<object>, fileId: string): void {
  useEffect(() => {
    const locks = engine.service(MODEL_EDIT_LOCKS);
    const sync = () => {
      const holders = new Map<string, string>();
      for (const collaborator of Object.values(useCollaboratorsStore.getState().collaborators)) {
        // A peer's state comes off the network: only a string names a model.
        const editing: unknown = collaborator.state.editing;
        if (collaborator.state.fileId === fileId && typeof editing === "string" && editing) {
          holders.set(editing, collaborator.id);
        }
      }
      locks.setRemote(holders);
    };
    sync();
    const stop = useCollaboratorsStore.subscribe(sync);
    return () => {
      stop();
      locks.setRemote(new Map());
    };
  }, [engine, fileId]);
}
