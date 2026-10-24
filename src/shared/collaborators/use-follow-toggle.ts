import { useCallback } from "react";

import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import type { FollowToggle } from "./use-follow-toggle.types";

/** Who the user follows, and following a collaborator or stopping when it's the one followed. */
export function useFollowToggle(): FollowToggle {
  const following = useCollaboratorsStore((state) => state.following);
  const toggle = useCallback((id: string) => {
    const store = useCollaboratorsStore.getState();
    if (store.following === id) store.unfollow();
    else store.follow(id);
  }, []);
  return { following, toggle };
}
