import { useEffect } from "react";

import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { useEngine } from "../../engine-context";
import { useCanvasFile } from "../../file";
import { useCollaboratorHistory } from "./use-collaborator-history";
import type { FollowedCollaborator } from "./use-follow-collaborator.types";

/**
 * Follows the collaborator the user picked, as Figma does: the camera shows exactly what it looks
 * at (switching to its page first), live, until the user moves the view themselves. While on,
 * Undo and Redo step through its history when that's allowed (`setHistoryTarget`).
 */
export function useFollowCollaborator(): FollowedCollaborator | null {
  const engine = useEngine();
  const { id: fileId } = useCanvasFile();
  const following = useCollaboratorsStore((state) =>
    state.following ? state.collaborators[state.following] : undefined,
  );
  const collaborator = following?.state.fileId === fileId ? following : null;
  const history = useCollaboratorHistory(collaborator);
  const followedId = collaborator?.id ?? null;
  const { scope, viewport } = collaborator?.state ?? {};
  const owner = collaborator?.name ?? null;
  const target = history?.history ?? null;

  // The camera follows its view (and its page) as they change.
  useEffect(() => {
    if (!followedId || !viewport) return;
    if (scope && scope !== engine.scope) engine.setScope(scope);
    engine.showViewport(viewport);
  }, [engine, followedId, scope, viewport]);

  // Moving the view yourself stops following.
  useEffect(() => {
    if (!followedId) return;
    return engine.onUserCamera(() => useCollaboratorsStore.getState().unfollow());
  }, [engine, followedId]);

  // Undo and Redo are its own while following.
  useEffect(() => {
    if (!owner || !target) return;
    engine.setHistoryTarget({ owner, history: target });
    return () => engine.setHistoryTarget(null);
  }, [engine, owner, target]);

  return collaborator ? { collaborator, history } : null;
}
