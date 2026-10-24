import { useMemo } from "react";

import type { Collaborator, CollaboratorKind } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";

/** The collaborators (only those of `kind` when given), in the order they joined. */
export function useCollaborators(kind?: CollaboratorKind): Collaborator[] {
  const collaborators = useCollaboratorsStore((state) => state.collaborators);
  return useMemo(
    () =>
      Object.values(collaborators)
        .filter((c) => !kind || c.kind === kind)
        .sort((a, b) => a.connectedAt - b.connectedAt),
    [collaborators, kind],
  );
}
