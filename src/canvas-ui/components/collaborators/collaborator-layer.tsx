import { useAgentServerStore } from "@shared/stores/agent-server-store";
import { CollaboratorCursors } from "./collaborator-cursors";
import { CollaboratorFollow } from "./collaborator-follow";
import { CollaboratorSelections } from "./collaborator-selections";

/**
 * Collaborators on the canvas: their selections and cursors on this page, and following one.
 * Laid over the canvas exactly, like the other DOM overlays.
 */
export function CollaboratorLayer() {
  const show = useAgentServerStore((state) => state.showCollaborators);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {show && (
        <>
          <CollaboratorSelections />
          <CollaboratorCursors />
        </>
      )}
      <CollaboratorFollow />
    </div>
  );
}
