import { collaboratorIsIdle } from "@shared/stores/collaborators-store";
import { useNow } from "@shared/ui/hooks/use-now";
import { CollaboratorCursor } from "./collaborator-cursor";
import { useCollaboratorsHere } from "./use-collaborators-here";

/** How often idle collaborators are looked for. */
const IDLE_CHECK_MS = 5_000;

/** The pointers of the collaborators on this file and page, where they last worked. */
export function CollaboratorCursors() {
  const here = useCollaboratorsHere();
  const now = useNow(IDLE_CHECK_MS);
  return here.map((collaborator) =>
    collaborator.state.cursor ? (
      <CollaboratorCursor
        key={collaborator.id}
        collaborator={collaborator}
        at={collaborator.state.cursor}
        idle={collaboratorIsIdle(collaborator, now)}
      />
    ) : null,
  );
}
