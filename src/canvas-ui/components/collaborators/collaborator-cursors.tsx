import {
  collaboratorIsIdle,
  collaboratorTraceHidden,
  TRACE_CHECK_MS,
} from "@shared/stores/collaborators-store";
import { useNow } from "@shared/ui/hooks/use-now";
import { CollaboratorCursor } from "./collaborator-cursor";
import { useCollaboratorsHere } from "./use-collaborators-here";

/** The pointers of the collaborators on this file and page, where they last worked. */
export function CollaboratorCursors() {
  const here = useCollaboratorsHere();
  const now = useNow(TRACE_CHECK_MS);
  return here.map((collaborator) =>
    collaborator.state.cursor ? (
      <CollaboratorCursor
        key={collaborator.id}
        collaborator={collaborator}
        at={collaborator.state.cursor}
        idle={collaboratorIsIdle(collaborator, now)}
        hidden={collaboratorTraceHidden(collaborator, now)}
      />
    ) : null,
  );
}
