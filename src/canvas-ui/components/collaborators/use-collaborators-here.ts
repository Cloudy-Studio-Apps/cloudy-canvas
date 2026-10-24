import { useMemo } from "react";

import type { Collaborator } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { useEngineState } from "../../engine-context";
import { useCanvasFile } from "../../file";

/** The collaborators working on this file, on the scope on screen (a design's page). */
export function useCollaboratorsHere(): Collaborator[] {
  const { id } = useCanvasFile();
  const scope = useEngineState((state) => state.scope);
  const collaborators = useCollaboratorsStore((state) => state.collaborators);
  return useMemo(
    () =>
      Object.values(collaborators).filter((c) => c.state.fileId === id && c.state.scope === scope),
    [collaborators, id, scope],
  );
}
