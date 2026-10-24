import { useMemo } from "react";

import type { Collaborator, CollaboratorKind } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";

/**
 * The collaborators (only those of `kind`, and of `source`, when given), in the order they joined.
 */
export function useCollaborators(kind?: CollaboratorKind, source?: string): Collaborator[] {
  const collaborators = useCollaboratorsStore((state) => state.collaborators);
  return useMemo(
    () =>
      Object.values(collaborators)
        .filter((c) => (!kind || c.kind === kind) && (!source || c.source === source))
        .sort((a, b) => a.connectedAt - b.connectedAt),
    [collaborators, kind, source],
  );
}
